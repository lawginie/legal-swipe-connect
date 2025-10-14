import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import WalletConnect from "@/components/WalletConnect";

interface Service {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
}

const LawyerDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    category: "bail_application",
    title: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("lawyer_services")
        .select("*")
        .eq("lawyer_id", user.id);

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error("Failed to load services");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newService.title || !newService.description || !newService.price) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("lawyer_services").insert({
        lawyer_id: user.id,
        category: newService.category as any,
        title: newService.title,
        description: newService.description,
        price: parseFloat(newService.price),
      });

      if (error) throw error;

      toast.success("Service added!");
      setShowAddForm(false);
      setNewService({ category: "bail_application", title: "", description: "", price: "" });
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to add service");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lawyer_services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Service deleted");
      fetchServices();
    } catch (error: any) {
      toast.error("Failed to delete service");
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Services</h1>
          <WalletConnect />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Add Service Button */}
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="w-full gap-2">
            <Plus className="h-5 w-5" />
            Add New Service
          </Button>
        )}

        {/* Add Service Form */}
        {showAddForm && (
          <Card className="p-6">
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <Label>Service Category</Label>
                <Select
                  value={newService.category}
                  onValueChange={(value) => setNewService({ ...newService, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bail_application">Bail Application</SelectItem>
                    <SelectItem value="debt_review">Debt Review</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="eviction">Eviction</SelectItem>
                    <SelectItem value="debt_collection">Debt Collection</SelectItem>
                    <SelectItem value="letter_of_demand">Letter of Demand</SelectItem>
                    <SelectItem value="contract_review">Contract Review</SelectItem>
                    <SelectItem value="divorce">Divorce</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Title</Label>
                <Input
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  placeholder="e.g., Standard Bail Application"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe your service..."
                  required
                />
              </div>

              <div>
                <Label>Price (ZAR)</Label>
                <Input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  placeholder="5000"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Service</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Services List */}
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize mb-2">
                    {service.category.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm mb-2">{service.description}</p>
                  <p className="text-accent font-bold">R {service.price}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteService(service.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {services.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No services added yet</p>
            <p className="text-sm">Add your first service to get started</p>
          </div>
        )}
      </div>

      <BottomNav userType="lawyer" />
    </div>
  );
};

export default LawyerDashboard;
