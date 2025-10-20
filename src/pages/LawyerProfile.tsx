import { useState } from "react";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MockProfile, LawyerService } from "@/data/mockProfiles";

interface LawyerProfileProps {
  lawyer: MockProfile;
  onBack: () => void;
}

interface SelectedService extends LawyerService {
  selected: boolean;
}

const LawyerProfile = ({ lawyer, onBack }: LawyerProfileProps) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    lawyer.services?.map(service => ({ ...service, selected: false })) || []
  );
  const [showBooking, setShowBooking] = useState(false);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, selected: !service.selected }
          : service
      )
    );
  };

  const getSelectedServices = () => {
    return selectedServices.filter(service => service.selected);
  };

  const calculateEstimatedTotal = () => {
    const selected = getSelectedServices();
    const serviceTotal = selected.reduce((total, service) => {
      // Use average of price range for estimation
      const avgPrice = (service.priceRange.min + service.priceRange.max) / 2;
      return total + avgPrice;
    }, 0);
    
    return serviceTotal;
  };

  const getTotalWithConsultation = () => {
    return calculateEstimatedTotal() + (lawyer.consultationFee || 0);
  };

  const handleBookConsultation = () => {
    const selected = getSelectedServices();
    if (selected.length === 0) {
      toast.error("Please select at least one service to book a consultation.");
      return;
    }

    // Simulate booking process
    const bookingData = {
      lawyer: lawyer.name,
      services: selected.map(s => s.name),
      consultationFee: lawyer.consultationFee,
      estimatedTotal: calculateEstimatedTotal(),
      totalWithConsultation: getTotalWithConsultation()
    };

    // Store booking in localStorage for demo purposes
    const existingBookings = JSON.parse(localStorage.getItem('consultationBookings') || '[]');
    const newBooking = {
      id: Date.now().toString(),
      ...bookingData,
      bookedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    localStorage.setItem('consultationBookings', JSON.stringify([...existingBookings, newBooking]));
    
    toast.success(`Consultation booked with ${lawyer.name}! Total: $${getTotalWithConsultation().toLocaleString()}`);
    setShowBooking(false);
    onBack();
  };

  if (!lawyer.services) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 p-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p>Service information not available for this lawyer.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Lawyer Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <img
                src={lawyer.image}
                alt={lawyer.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-xl font-bold">{lawyer.name}</h1>
                  {lawyer.verified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{lawyer.rating}</span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{lawyer.location}</span>
                </div>
                <Badge variant="secondary" className="mb-2">
                  {lawyer.specialization}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">{lawyer.availability}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mt-4">{lawyer.bio}</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  Consultation Fee: ${lawyer.consultationFee}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  service.selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={service.selected}
                    onChange={() => handleServiceToggle(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration: {service.duration}</span>
                      <span className="font-semibold text-green-600">
                        ${service.priceRange.min.toLocaleString()} - ${service.priceRange.max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Selected Services Summary */}
        {getSelectedServices().length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selected Services Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {getSelectedServices().map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span className="font-medium">
                      ${((service.priceRange.min + service.priceRange.max) / 2).toLocaleString()}*
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Estimated Services Total:</span>
                  <span className="font-medium">${calculateEstimatedTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Consultation Fee:</span>
                  <span className="font-medium">${lawyer.consultationFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">${getTotalWithConsultation().toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *Estimated cost based on average pricing. Final cost may vary.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Book Consultation Button */}
        <Button
          onClick={handleBookConsultation}
          disabled={getSelectedServices().length === 0}
          className="w-full py-3 text-lg font-semibold"
          size="lg"
        >
          Book Consultation
          {getSelectedServices().length > 0 && (
            <span className="ml-2">
              (${getTotalWithConsultation().toLocaleString()})
            </span>
          )}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Select services above to book a consultation with {lawyer.name}
        </p>
      </div>
    </div>
  );
};

export default LawyerProfile;