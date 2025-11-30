import { Link } from 'wouter';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-brand-400">JK Cars</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Premium car rental and excursion services across Tunisia. Based in Hammamet, serving the entire country.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover-elevate p-2 rounded-lg bg-white/10" data-testid="link-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover-elevate p-2 rounded-lg bg-white/10" data-testid="link-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover-elevate p-2 rounded-lg bg-white/10" data-testid="link-twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-brand-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/fleet" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-fleet">Our Fleet</Link></li>
              <li><Link href="/excursions" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-excursions">Excursions</Link></li>
              <li><Link href="/airport-transfers" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-airport">Airport Transfers</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-about">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-contact">Contact</Link></li>
              <li><Link href="/admin" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-admin">Administration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-brand-400">Operating Cities</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Hammamet</li>
              <li>Tunis</li>
              <li>Sousse</li>
              <li>Monastir</li>
              <li>Sfax</li>
              <li>Djerba</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-brand-400">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Avenue Habib Bourguiba, Hammamet, Tunisia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span className="text-gray-300">+216 72 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span className="text-gray-300">info@jkcars.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 JK Cars. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
