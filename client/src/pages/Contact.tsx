import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', { name, email, message });
    alert(t('contact.thankYouMessage'));
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">{t('contact.sendMessage')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">{t('contact.yourName')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('contact.namePlaceholder')}
                    required
                    data-testid="input-contact-name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('contact.emailAddress')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('contact.emailPlaceholder')}
                    required
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <Label htmlFor="message">{t('contact.message')}</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={6}
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" data-testid="button-send-message">
                  {t('contact.send')}
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">{t('contact.contactInfo')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{t('contact.address')}</div>
                    <div className="text-gray-600 whitespace-pre-line">{t('contact.addressValue')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Phone className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{t('contact.phone')}</div>
                    <div className="text-gray-600">+216 72 123 456</div>
                    <div className="text-gray-600">+216 98 765 432</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{t('contact.email')}</div>
                    <div className="text-gray-600">info@jkcars.tn</div>
                    <div className="text-gray-600">support@jkcars.tn</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Clock className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{t('contact.businessHours')}</div>
                    <div className="text-gray-600">{t('contact.mondaySaturday')}</div>
                    <div className="text-gray-600">{t('contact.sunday')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">{t('contact.followUs')}</h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="p-3 bg-brand-50 rounded-lg hover-elevate transition-all"
                    data-testid="link-contact-facebook"
                  >
                    <Facebook className="w-6 h-6 text-brand-600" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-brand-50 rounded-lg hover-elevate transition-all"
                    data-testid="link-contact-instagram"
                  >
                    <Instagram className="w-6 h-6 text-brand-600" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-brand-50 rounded-lg hover-elevate transition-all"
                    data-testid="link-contact-twitter"
                  >
                    <Twitter className="w-6 h-6 text-brand-600" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-2 overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102849.09271814108!2d10.513773!3d36.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd61e820cca78f%3A0x6e0a0ec5a1b8d!2sHammamet%2C%20Tunisia!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="JK Cars Location"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
