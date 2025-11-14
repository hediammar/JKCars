import { motion } from 'framer-motion';
import { Award, Shield, Users, MapPin, Heart, TrendingUp } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Your safety is our top priority. All vehicles undergo rigorous maintenance checks.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service delivery.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction drives everything we do. We go the extra mile for you.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Embracing technology to provide seamless booking and rental experiences.',
    },
  ];

  const coverage = [
    'Tunis', 'Hammamet', 'Sousse', 'Monastir', 'Sfax', 'Djerba',
    'Kairouan', 'Tozeur', 'Douz', 'Nabeul', 'Bizerte', 'Gabès'
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div
        className="relative h-96 flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 to-brand-800/80" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            About JK Cars
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-brand-100 max-w-2xl mx-auto"
          >
            Driving innovation in car rental and tourism across Tunisia
          </motion.p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Founded in Hammamet, JK Cars has grown to become Tunisia's premier car rental and excursion service. 
                What started as a small family business with just three vehicles has evolved into a comprehensive mobility solution 
                serving thousands of satisfied customers across the country.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We understand that exploring Tunisia requires reliable transportation and expert guidance. That's why we've built 
                a company that combines cutting-edge technology with traditional Tunisian hospitality, offering both modern vehicles 
                and authentic cultural experiences.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is simple: to provide transparent, affordable, and exceptional service that makes your journey through 
                Tunisia unforgettable. From the Mediterranean coast to the Sahara Desert, we're with you every mile of the way.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-5xl font-bold mb-2">10+</div>
                <div className="text-brand-100">Years Experience</div>
              </div>
              <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-5xl font-bold mb-2">10+</div>
                <div className="text-brand-100">Premium Vehicles</div>
              </div>
              <div className="bg-gradient-to-br from-brand-700 to-brand-800 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-brand-100">Happy Clients</div>
              </div>
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-5xl font-bold mb-2">20+</div>
                <div className="text-brand-100">Destinations</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 mb-4 shadow-lg shadow-brand-500/30">
                  <value.icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 mb-6 shadow-xl shadow-brand-500/30">
              <MapPin className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nationwide Coverage</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              We operate across Tunisia, serving all major cities and tourist destinations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-2xl p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {coverage.map((city, index) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span className="font-medium text-gray-700">{city}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
