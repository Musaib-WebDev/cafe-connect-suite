import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cafeAPI } from '@/lib/api';
import { Coffee, MapPin, Star, Search, Clock, Wifi, Car } from 'lucide-react';
import { toast } from 'sonner';

interface Cafe {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  images: Array<{
    url: string;
    caption: string;
  }>;
  rating: {
    average: number;
    count: number;
  };
  cuisine: string[];
  amenities: string[];
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);

  useEffect(() => {
    fetchCafes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cafes.filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cafe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cafe.address.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCafes(filtered);
    } else {
      setFilteredCafes(cafes);
    }
  }, [searchTerm, cafes]);

  const fetchCafes = async () => {
    try {
      const response = await cafeAPI.getCafes({ limit: 12 });
      setCafes(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load cafes');
      console.error('Error fetching cafes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const isOpenNow = (operatingHours: Cafe['operatingHours']) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = operatingHours[currentDay];
    if (!todayHours || todayHours.closed) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Coffee className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to <span className="text-primary">CafeManager</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover amazing cafes, place orders, make reservations, and enjoy great coffee experiences.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link to="/cafes">Explore Cafes</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/register">Join Now</Link>
          </Button>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cafes by name, location, or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </section>

      {/* Featured Cafes */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Cafes</h2>
          <Button variant="outline" asChild>
            <Link to="/cafes">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCafes.slice(0, 6).map((cafe) => (
            <Card key={cafe._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {cafe.images?.[0]?.url ? (
                  <img
                    src={cafe.images[0].url}
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Coffee className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={isOpenNow(cafe.operatingHours) ? 'default' : 'secondary'}>
                    <Clock className="h-3 w-3 mr-1" />
                    {isOpenNow(cafe.operatingHours) ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cafe.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {cafe.address.city}, {cafe.address.state}
                    </CardDescription>
                  </div>
                  {cafe.rating.count > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{cafe.rating.average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {cafe.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {cafe.description}
                  </p>
                )}
                
                {cafe.cuisine.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cafe.cuisine.slice(0, 3).map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {cafe.cuisine.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{cafe.cuisine.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {cafe.amenities.length > 0 && (
                  <div className="flex space-x-2">
                    {cafe.amenities.slice(0, 3).map((amenity) => (
                      <div key={amenity} className="flex items-center text-muted-foreground">
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>
                )}
                
                <Button asChild className="w-full">
                  <Link to={`/cafes/${cafe._id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/50 rounded-lg">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">Why Choose CafeManager?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Coffee className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Discover Great Cafes</h3>
              <p className="text-muted-foreground">
                Find the perfect cafe for your mood, location, and taste preferences.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Easy Ordering</h3>
              <p className="text-muted-foreground">
                Order ahead and skip the line. Your coffee will be ready when you arrive.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Reserve Tables</h3>
              <p className="text-muted-foreground">
                Book your favorite spot in advance and never worry about finding a table.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;