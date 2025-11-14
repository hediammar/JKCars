import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Car as CarType } from '@shared/schema';
import { Users, Fuel, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CarCardProps {
  car: CarType;
  index?: number;
}

export default function CarCard({ car, index = 0 }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        <div className="relative h-56 overflow-hidden">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {car.discount && (
            <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 shadow-lg">
              {car.discount}% OFF
            </Badge>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-2xl font-bold" data-testid={`text-car-name-${car.id}`}>{car.name}</h3>
            <p className="text-brand-200 text-sm">{car.model}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 text-brand-500" />
              <span className="text-sm">{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Settings className="w-4 h-4 text-brand-500" />
              <span className="text-sm">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Fuel className="w-4 h-4 text-brand-500" />
              <span className="text-sm">{car.fuel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-brand-600" data-testid={`text-price-${car.id}`}>
                {car.discount ? (
                  <>
                    <span className="line-through text-gray-400 text-xl mr-2">{car.price}DT</span>
                    {Math.round(car.price * (1 - car.discount / 100))}DT
                  </>
                ) : (
                  `${car.price}DT`
                )}
              </div>
              <div className="text-sm text-gray-500">per day</div>
            </div>
          </div>

          <Link href={`/car/${car.id}`}>
            <Button className="w-full group/btn" data-testid={`button-view-details-${car.id}`}>
              View Details
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
