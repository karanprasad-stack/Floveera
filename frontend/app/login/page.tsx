'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, ArrowLeft, Loader2, User, Phone, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginUser, firebaseLogin, checkUserExists, registerUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Firebase imports
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

import { COUNTRIES } from '@/lib/countries';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

type AuthStep = 'IDENTIFIER' | 'PASSWORD' | 'NEW_USER' | 'REGISTER' | 'OTP' | 'FORGOT_PASSWORD';

export default function LoginPage() {
  const router = useRouter();

  // Core States
  const [step, setStep] = useState<AuthStep>('IDENTIFIER');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // IDENTIFIER States
  const [identifier, setIdentifier] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [resolvedIdentifier, setResolvedIdentifier] = useState('');
  const [isPhoneConfig, setIsPhoneConfig] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // PASSWORD / REGISTER States
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  // OTP States
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      } catch (e) {}
    }
    
    // Auto-select location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_calling_code) setCountryCode(data.country_calling_code);
      }).catch(() => {});

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFetchError = (err: any) => {
    const msg = err?.message || '';
    if (msg.includes('Failed to fetch')) {
      setErrorMsg('Server not responding. Please check your connection.');
    } else {
      setErrorMsg(msg || 'An error occurred. Please try again.');
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const data = await firebaseLogin(idToken);
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/')
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      // Reveal the actual error reason to help debug
      setErrorMsg('Google sign-in failed: ' + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return setErrorMsg('Please enter an email or mobile number');
    
    setIsSubmitting(true);
    setErrorMsg('');

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const parsedIdent = isEmail ? identifier : `${countryCode}${identifier.replace(/\D/g, '')}`;
    
    setIsPhoneConfig(!isEmail);
    setResolvedIdentifier(parsedIdent);

    try {
      const res = await checkUserExists(parsedIdent);
      if (res.exists) {
        setStep('PASSWORD');
      } else {
        setStep('NEW_USER');
      }
    } catch (err: any) {
      handleFetchError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setErrorMsg('Please enter your password');
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const data = await loginUser({ identifier: resolvedIdentifier, password });
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setErrorMsg('Invalid password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFirebaseOTP = async (phoneString: string) => {
    if (!auth?.app?.options?.apiKey || auth.app.options.apiKey.includes('MOCK')) {
      throw new Error('Firebase Config Missing! Need actual keys to send SMS.');
    }
    const appVerifier = window.recaptchaVerifier;
    const confirmation = await signInWithPhoneNumber(auth, phoneString, appVerifier);
    setConfirmationResult(confirmation);
    startResendTimer();
  };

  const handleRequestOTP = async (isNewUser: boolean = false) => {
    setIsSubmitting(true);
    setErrorMsg('');
    const targetPhone = isNewUser ? `${countryCode}${registerPhone}` : resolvedIdentifier;

    try {
      await triggerFirebaseOTP(targetPhone);
      setStep('OTP');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send OTP. Try again.');
      if (window.recaptchaVerifier) window.recaptchaVerifier.render().catch(() => {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await confirmationResult.confirm(otp);
      
      // If we are coming from registration, we must create them in the DB first
      if (step === 'OTP' && name && password) {
         const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
         await registerUser({
           name,
           password,
           email: isEmail ? identifier : undefined,
           phone: `${countryCode}${registerPhone}`
         });
      }

      // Finalize Firebase Token Login
      const idToken = await result.user.getIdToken();
      const data = await firebaseLogin(idToken);
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/')
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Invalid OTP. Please check the code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-brand-blue to-brand-orange py-10">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="bg-white p-8 rounded-3xl shadow-2xl border border-white/50 relative"
        >
          <button 
             onClick={() => {
               setErrorMsg('');
               if (step === 'IDENTIFIER') {
                 router.back();
               } else {
                 setStep((s) => s === 'PASSWORD' || s === 'NEW_USER' ? 'IDENTIFIER' : 
                                s === 'REGISTER' ? 'NEW_USER' : 
                                s === 'OTP' && name ? 'REGISTER' : 'IDENTIFIER');
               }
             }}
             className="absolute top-6 left-6 text-gray-500 hover:text-brand-orange transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 z-10"
             aria-label="Go back"
          >
             <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
             <motion.div
               className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white mb-4 shadow-xl shadow-brand-orange/20 overflow-hidden border-2 border-brand-orange/10 mt-8 sm:mt-0"
             >
               <Image 
                 src="/images/floveera_logo_1024.png" 
                 alt="Floveera Logo" 
                 width={112} 
                 height={112} 
                 className="object-cover w-full h-full rounded-full"
                 priority
               />
             </motion.div>
             
             {step === 'IDENTIFIER' && <h1 className="text-3xl font-bold text-brand-text mb-2">Welcome Back</h1>}
             {step === 'PASSWORD' && <h1 className="text-3xl font-bold text-brand-text mb-2">Sign In</h1>}
             {step === 'NEW_USER' && <h1 className="text-3xl font-bold text-brand-text mb-2">Create Account</h1>}
             {step === 'REGISTER' && <h1 className="text-3xl font-bold text-brand-text mb-2">Detailed Profile</h1>}
             {step === 'OTP' && <h1 className="text-3xl font-bold text-brand-text mb-2">Verify Mobile</h1>}

             {step === 'IDENTIFIER' && <p className="text-gray-500">Sign in to continue to Floveera</p>}
             {step === 'PASSWORD' && <p className="text-gray-500">{resolvedIdentifier}</p>}
             {step === 'NEW_USER' && <p className="text-gray-500">It looks like you are new!</p>}
             {step === 'OTP' && <p className="text-gray-500">Code sent to {name ? `${countryCode}${registerPhone}` : resolvedIdentifier}</p>}
          </div>

          <div id="recaptcha-container"></div>

          {errorMsg && (
             <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 mb-4 animate-in fade-in slide-in-from-top-2">
               {errorMsg}
             </div>
          )}

          {step === 'IDENTIFIER' && (
             <div className="space-y-4 mb-6">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm py-6 text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
             </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* IDENTIFIER MODE */}
            {step === 'IDENTIFIER' && (
              <motion.form 
                key="identifier-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={verifyIdentifier} 
                className="space-y-6"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center h-14 focus-within:bg-white focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange transition-all overflow-hidden group hover:border-gray-300 px-2">
                   <AnimatePresence>
                     {identifier.length > 0 && !/[a-zA-Z@]/.test(identifier) && (
                       <motion.div 
                         initial={{ width: 0, opacity: 0 }}
                         animate={{ width: 'auto', opacity: 1 }}
                         exit={{ width: 0, opacity: 0 }}
                         className="flex items-center overflow-hidden flex-shrink-0"
                       >
                         <select 
                           value={countryCode} 
                           onChange={(e) => setCountryCode(e.target.value)}
                           className="bg-transparent text-gray-500 font-medium outline-none py-2 pr-1 cursor-pointer appearance-none text-sm z-10 relative"
                         >
                            {COUNTRIES.map(c => (
                               <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                                 {c.flag} {c.dialCode}
                               </option>
                            ))}
                         </select>
                         <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   
                   <input
                      type="text"
                      placeholder="Email or mobile phone number"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="flex-grow bg-transparent text-brand-text placeholder:text-gray-400 outline-none w-full px-1"
                      required
                   />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-orange to-brand-blue hover:from-brand-orangeHover hover:to-brand-blue text-white border-0 shadow-lg shadow-brand-blue/30 group py-6 text-lg rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Continue'}
                </Button>
              </motion.form>
            )}

            {/* PASSWORD MODE */}
            {step === 'PASSWORD' && (
              <motion.form 
                key="password-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePasswordLogin} 
                className="space-y-6"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-50 border-gray-200 text-brand-text focus:bg-white focus:border-brand-orange transition-all h-14 rounded-lg"
                    required
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-brand-orange transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link href="#" className="text-brand-orange hover:text-brand-orangeHover transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <div className="space-y-3">
                   <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-gradient-to-r from-brand-orange to-brand-blue hover:from-brand-orangeHover text-white border-0 shadow-lg py-6 text-lg rounded-xl transition-all"
                   >
                     {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
                   </Button>
                   {isPhoneConfig && (
                     <Button
                       type="button"
                       variant="outline"
                       disabled={isSubmitting}
                       onClick={() => handleRequestOTP()}
                       className="w-full bg-white text-gray-700 py-6 text-lg rounded-xl hover:bg-gray-50"
                     >
                       Get OTP instead
                     </Button>
                   )}
                </div>
              </motion.form>
            )}

            {/* NEW USER INTERCEPT */}
            {step === 'NEW_USER' && (
              <motion.div 
                key="new-user-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 flex flex-col gap-2">
                   <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Creating account for</span>
                   <span className="text-lg font-medium text-brand-text">{resolvedIdentifier}</span>
                </div>
                
                <Button
                  type="button"
                  onClick={() => setStep('REGISTER')}
                  className="w-full bg-gradient-to-r from-brand-orange to-brand-blue text-white shadow-lg py-6 text-lg rounded-xl"
                >
                  Create Account
                </Button>
              </motion.div>
            )}

            {/* REGISTER DETAILS */}
            {step === 'REGISTER' && (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => { e.preventDefault(); handleRequestOTP(true); }} 
                className="space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <Input 
                     placeholder="First and last name" 
                     value={name} onChange={e => setName(e.target.value)}
                     className="pl-10 h-14 bg-gray-50" required
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center h-14 overflow-hidden">
                   <div className="flex-shrink-0 relative">
                      <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent text-gray-500 font-medium outline-none py-2 px-3 cursor-pointer text-sm line-clamp-1"
                      >
                         {COUNTRIES.map(c => (
                            <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}> {c.flag} {c.dialCode} </option>
                         ))}
                      </select>
                   </div>
                   <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
                   <input
                      type="tel"
                      placeholder="Mobile number"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-grow bg-transparent text-brand-text outline-none px-2"
                      required minLength={5}
                   />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input 
                     type="password" placeholder="Create robust password (min 6 chars)" 
                     value={password} onChange={e => setPassword(e.target.value)}
                     className="pl-10 h-14 bg-gray-50" required minLength={6}
                  />
                </div>
                
                <p className="text-xs text-gray-500 pb-2">We will send a text with a verification code.</p>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-orange to-brand-blue text-white shadow-lg py-6 text-lg rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify mobile number'}
                </Button>
              </motion.form>
            )}

            {/* OTP VERIFICATION */}
            {step === 'OTP' && (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                    className="text-center tracking-[0.5em] h-14 text-2xl font-semibold bg-gray-50 border-gray-200 focus:bg-white focus:border-brand-orange"
                    required
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-orange to-brand-blue text-white shadow-lg py-6 text-lg rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (name ? 'Create account' : 'Verify & Sign In')}
                </Button>

                <div className="text-center space-y-3 pt-2">
                   <button 
                      type="button"
                      disabled={resendTimer > 0 || isSubmitting}
                      onClick={() => handleRequestOTP(!!name)}
                      className={`text-sm font-medium ${resendTimer > 0 ? 'text-gray-400' : 'text-brand-orange hover:text-brand-orangeHover'}`}
                   >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                   </button>
                   
                   <div className="text-sm">
                      <Button type="button" variant="link" className="text-gray-400 line-through cursor-not-allowed">
                         Send OTP via WhatsApp (Coming Soon)
                      </Button>
                   </div>
                </div>
              </motion.form>
            )}

          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
