import FeatureCard from '../FeatureCard';
import { Car } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <FeatureCard
      icon={Car}
      title="Premium Fleet"
      description="Choose from our selection of premium vehicles, all less than 2 years old and meticulously maintained."
    />
  );
}
