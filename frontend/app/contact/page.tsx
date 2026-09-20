'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <section className="bg-gradient-to-r from-brand-blue to-brand-orange text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              We'd love to hear from you. Visit us or get in touch!
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-brand-blue mb-8">Get In Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-brand-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Address</h3>
                    <p className="text-gray-600">
                      Village – Matar<br />
                      Tola – Matar<br />
                      Post – Umapur<br />
                      Police Station – Bhagwanpur<br />
                      Panchayat – Paharia<br />
                      Block – Bhagwanpur<br />
                      District – Kaimur (Bhabua)<br />
                      Pin Code – 821102<br />
                      State – Bihar<br />
                      Country – India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-brand-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Phone / WhatsApp</h3>
                    <a href="tel:9113342012" className="text-brand-blue hover:underline text-lg">
                      9113342012
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-brand-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <a href="mailto:mart.floveera@gmail.com" className="text-brand-blue hover:underline">
                      mart.floveera@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-brand-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                    <p className="text-gray-600 text-lg">9 AM – 10 PM</p>
                    <p className="text-sm text-gray-500 mt-1">Open all days</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/floveeraindiaofficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-orange p-4 rounded-full hover:bg-orange-600 transition-colors"
                  >
                    <Instagram className="h-6 w-6 text-white" />
                  </a>
                  <a
                    href="https://www.facebook.com/floveeraindiaoffical"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-orange p-4 rounded-full hover:bg-orange-600 transition-colors"
                  >
                    <Facebook className="h-6 w-6 text-white" />
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="https://wa.me/919113342012"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-green text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors inline-block shadow-lg"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3623.123456789!2d83.5!3d25.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDAwJzAwLjAiTiA4M8KwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Meet the Team Behind Floveera</h2>
            <p className="text-xl text-gray-500">Passionate people building a modern retail and food experience</p>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-blue to-brand-orange mx-auto mt-6 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Arjun Kumar - CEO */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-400 text-center group border border-gray-100 hover:border-brand-orange/40"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-brand-orange/20 group-hover:ring-brand-orange transition-all duration-300">
                <img src="/images/arjun_kumar.jpg" alt="Arjun Kumar" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-1">Arjun Kumar</h3>
              <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">CEO & Founder</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Visionary leader behind Floveera, focused on building a one-stop destination for shopping, food, and celebrations.</p>
              <div className="flex justify-center gap-3 mb-4">
                <a href="https://www.instagram.com/arjun911765kumar/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="https://www.facebook.com/share/1b8mVr3sV1/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-blue hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="mailto:arjun.floveera@gmail.com" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
              <a href="mailto:arjun.floveera@gmail.com" className="text-xs text-brand-blue hover:text-brand-orange transition-colors font-medium">arjun.floveera@gmail.com</a>
            </motion.div>

            {/* Harendra Kumar - Co-Founder */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-400 text-center group border border-gray-100 hover:border-brand-blue/40"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-brand-blue/20 group-hover:ring-brand-blue transition-all duration-300">
                <img src="/images/harendra_kumar.jpg" alt="Harendra Kumar" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-1">Harendra Kumar</h3>
              <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Co-Founder</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Co-founder driving operations and growth strategy, helping scale Floveera into a trusted local brand.</p>
              <div className="flex justify-center gap-3 mb-4">
                <a href="https://www.instagram.com/kumarsahniharendra" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="https://www.facebook.com/share/1Fz2vxq95z/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-blue hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="mailto:Harendra.floveera@gmail.com" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
              <a href="mailto:Harendra.floveera@gmail.com" className="text-xs text-brand-blue hover:text-brand-orange transition-colors font-medium">Harendra.floveera@gmail.com</a>
            </motion.div>

            {/* Upendra Kumar - Finance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-400 text-center group border border-gray-100 hover:border-brand-orange/40"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-gray-200 group-hover:ring-brand-orange transition-all duration-300">
                <img src="/images/upendra.jpg" alt="Upendra Kumar" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-1">Upendra Kumar</h3>
              <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Finance & Purchase Head</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Manages financial planning, inventory purchasing, and ensures smooth supply chain operations.</p>
              <div className="flex justify-center gap-3 mb-4">
                <a href="https://www.instagram.com/upendraprasad3314" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="https://www.facebook.com/share/1B3ZftgKTo/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-blue hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="mailto:upendra.floveera@gmail.com" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
              <a href="mailto:upendra.floveera@gmail.com" className="text-xs text-brand-blue hover:text-brand-orange transition-colors font-medium">upendra.floveera@gmail.com</a>
            </motion.div>

            {/* Jitendra Prasad kevat - Operations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-400 text-center group border border-gray-100 hover:border-brand-blue/40"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-gray-200 group-hover:ring-brand-blue transition-all duration-300">
                <img src="/images/jitendra.jpeg" alt="Jitendra Kumar" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-1">Jitendra Prasad Kevat</h3>
              <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Operation Head</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Responsible for daily operations, team coordination, and ensuring smooth functioning of the business.</p>
              <div className="flex justify-center gap-3 mb-4">
                <a href="mailto:jitendra.floveera@gmail.com" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 hover:scale-110" title="Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
              <a href="mailto:jitendra.floveera@gmail.com" className="text-xs text-brand-blue hover:text-brand-orange transition-colors font-medium">jitendra.floveera@gmail.com</a>
            </motion.div>

          </div>

          {/* Kaushal Kumar - CTO (Full Width Card) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-gradient-to-br from-brand-blue to-blue-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-400 group border border-brand-blue/20"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/30 group-hover:ring-brand-orange transition-all duration-300">
                  <img src="/images/kaushal2.jpeg" alt="Kaushal Kumar" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-1">Kaushal Kumar</h3>
                <p className="text-brand-orange text-sm font-bold uppercase tracking-widest mb-3">CTO — Chief Technology Officer</p>
                <p className="text-white/80 text-sm leading-relaxed mb-5 max-w-xl">Leads technology and digital systems, building the Floveera website, platform, and future tech infrastructure.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <a href="https://www.instagram.com/kaushal.ranjh" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-orange text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="Instagram">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                  <a href="https://www.facebook.com/share/1Dzu8vKSGv/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500 text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="Facebook">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/kaushal-kumar-5014a5300" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-sky-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="LinkedIn">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                  <a href="https://x.com/KumarR28652" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-gray-900 text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="X / Twitter">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="https://github.com/kaushal13x" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="GitHub">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                  </a>
                  <a href="https://medium.com/@kumarkaushalranjh735" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-green-700 text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="Medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" /></svg>
                  </a>
                  <a href="https://dapper-bavarois-f1438d.netlify.app" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-teal-500 text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="Portfolio">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                  </a>
                  <a href="mailto:kumarkaushalranjh@gmail.com" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-orange text-white flex items-center justify-center transition-all duration-200 hover:scale-110" title="Email">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </a>
                </div>
                <a href="mailto:kumarkaushalranjh@gmail.com" className="text-xs text-white/70 hover:text-brand-orange transition-colors font-medium">kumarkaushalranjh@gmail.com</a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16 text-gray-400 text-base italic"
          >
            &ldquo;Our team is dedicated to delivering quality, convenience, and innovation through Floveera.&rdquo;
          </motion.div>
        </div>
      </section>


      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Floveera?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div>
                <div className="text-5xl font-bold text-brand-orange mb-2">1000+</div>
                <p className="text-lg">Products Available</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-brand-orange mb-2">100%</div>
                <p className="text-lg">Quality Assured</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-brand-orange mb-2">Daily</div>
                <p className="text-lg">Fresh Food</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
