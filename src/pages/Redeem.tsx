import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, ShoppingBag, Coffee, Utensils, Car, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Redeem = () => {
  const { user, updateUserPoints } = useAuth();
  const userPoints = user?.points || 0;

  const vouchers = [
    {
      id: 1,
      title: "Starbucks Coffee Voucher",
      description: "Get a free medium coffee at any Starbucks location",
      points: 50,
      category: "food",
      icon: Coffee,
      brand: "Starbucks",
      value: "$5",
      featured: true,
    },
    {
      id: 2,
      title: "Amazon Gift Card",
      description: "$10 Amazon gift card for online shopping",
      points: 100,
      category: "shopping",
      icon: ShoppingBag,
      brand: "Amazon",
      value: "$10",
      featured: true,
    },
    {
      id: 3,
      title: "McDonald's Meal Voucher",
      description: "Free Big Mac meal at McDonald's",
      points: 75,
      category: "food",
      icon: Utensils,
      brand: "McDonald's",
      value: "$8",
      featured: false,
    },
    {
      id: 4,
      title: "Uber Ride Credit",
      description: "$15 credit for your next Uber ride",
      points: 150,
      category: "transport",
      icon: Car,
      brand: "Uber",
      value: "$15",
      featured: false,
    },
    {
      id: 5,
      title: "Local Restaurant Voucher",
      description: "20% off at participating local restaurants",
      points: 80,
      category: "food",
      icon: Heart,
      brand: "Local Partners",
      value: "20% off",
      featured: false,
    },
    {
      id: 6,
      title: "Target Gift Card",
      description: "$25 Target gift card for in-store or online shopping",
      points: 200,
      category: "shopping",
      icon: ShoppingBag,
      brand: "Target",
      value: "$25",
      featured: true,
    },
  ];

  const categoryColors: Record<string, string> = {
    food: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    shopping: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    transport: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const handleRedeem = async (voucher: any) => {
    if (!user?.id) {
      toast.error("Please login to redeem vouchers");
      return;
    }

    if (userPoints < voucher.points) {
      toast.error("Insufficient points to redeem this voucher");
      return;
    }

    // Deduct points from user account
    updateUserPoints(-voucher.points, 'redeem');
    
    toast.success(`Successfully redeemed ${voucher.title}!`, {
      description: `${voucher.points} points deducted. Check your email for the voucher code.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Redeem Points</h1>
          <p className="text-muted-foreground">
            Exchange your civic engagement points for amazing rewards
          </p>
        </div>

        {/* Points Balance */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{userPoints} Points</h3>
                <p className="text-muted-foreground">Available to redeem</p>
              </div>
            </div>
            <Gift className="w-12 h-12 text-primary/50" />
          </div>
        </Card>

        {/* Vouchers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => {
            const IconComponent = voucher.icon;
            const canRedeem = userPoints >= voucher.points;
            
            return (
              <Card
                key={voucher.id}
                className={`overflow-hidden transition-all duration-300 border-2 ${
                  canRedeem 
                    ? "hover:shadow-xl hover:border-primary/20" 
                    : "opacity-60 border-gray-200"
                }`}
              >
                {voucher.featured && (
                  <div className="bg-gradient-to-r from-primary to-secondary px-4 py-2">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Star className="w-4 h-4 fill-white" />
                      Popular
                    </div>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight">{voucher.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{voucher.brand}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {voucher.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge className={`${categoryColors[voucher.category]} border`}>
                      {voucher.category}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-semibold text-primary">{voucher.value}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Required Points</span>
                      <span className="font-bold text-lg">{voucher.points} pts</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      disabled={!canRedeem}
                      onClick={() => handleRedeem(voucher)}
                    >
                      {canRedeem ? "Redeem Now" : "Insufficient Points"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* How it Works */}
        <Card className="mt-12 p-6">
          <h3 className="text-xl font-bold mb-4">How Redemption Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold mb-2">Earn Points</h4>
              <p className="text-sm text-muted-foreground">
                Report issues, join events, and contribute to your community
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold mb-2">Choose Reward</h4>
              <p className="text-sm text-muted-foreground">
                Browse available vouchers and select your preferred reward
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold mb-2">Enjoy Reward</h4>
              <p className="text-sm text-muted-foreground">
                Receive your voucher code via email and enjoy your reward
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Redeem;