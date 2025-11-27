import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Excursion } from '@shared/schema';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExcursionCardProps {
  excursion: Excursion;
  index?: number;
  onBook?: (excursion: Excursion) => void;
}

export default function ExcursionCard({ excursion, index = 0, onBook }: ExcursionCardProps) {
  const { t } = useLanguage();
  const largeGroupPrice = excursion.price3 ?? excursion.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
        <Link href={`/excursion/${excursion.id}`}>
          <div className="relative h-64 overflow-hidden cursor-pointer">
            <img
              src={excursion.image}
              alt={excursion.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-white/30 text-white">
              {excursion.duration}
            </Badge>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-brand-200 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {excursion.destination}
              </div>
            <h3 className="text-white text-xl font-bold" data-testid={`text-excursion-title-${excursion.id}`}>
                {excursion.title}
              </h3>
            </div>
          </div>
        </Link>

        <div className="p-6 flex-1 flex flex-col">
          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
            {excursion.description}
          </p>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('excursions.highlights')}
            </h4>
            <ul className="space-y-1">
              {excursion.highlights.slice(0, 3).map((highlight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-brand-500 mt-0.5">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto">
            <div className="mb-4 pb-4 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div
                    className="text-2xl font-bold text-brand-600"
                    data-testid={`text-excursion-price-${excursion.id}`}
                  >
                    {excursion.price}DT
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('excursions.smallGroupLabel')} · {t('excursions.perGroup')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {largeGroupPrice}DT
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('excursions.largeGroupLabel')} · {t('excursions.perGroup')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-brand-500" />
                <span className="text-sm">{excursion.duration}</span>
              </div>
            </div>

            <Link href={`/excursion/${excursion.id}`}>
              <Button
                className="w-full group/btn"
                onClick={() => onBook?.(excursion)}
                data-testid={`button-book-excursion-${excursion.id}`}
              >
                {t('excursions.bookNow')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
