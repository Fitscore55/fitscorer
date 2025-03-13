
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageSquare, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HelpSupport = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send the form data to backend
    console.log("Submitting support request:", contactForm);
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond shortly.",
    });
    setContactForm({
      subject: "",
      message: "",
    });
  };

  const faqs = [
    {
      question: "How do I track my daily steps?",
      answer: "FitScore automatically syncs with your phone's health data to track steps. Make sure to grant the necessary permissions in your phone settings. You can view your daily progress in the home dashboard."
    },
    {
      question: "How do I join a challenge?",
      answer: "Navigate to the Challenges tab from the bottom menu. Browse available challenges and tap 'Join Challenge' on any that interest you. You can track your progress from the same screen."
    },
    {
      question: "How are FitCoins calculated?",
      answer: "FitCoins are earned based on your activity. You earn 1 FitCoin for every 1,000 steps walked. Additional coins can be earned by completing challenges and reaching daily goals."
    },
    {
      question: "Can I connect with friends?",
      answer: "Yes! You can send friend requests by searching for usernames. Once connected, you can view each other's progress and compete in challenges together."
    },
    {
      question: "How do I redeem rewards?",
      answer: "Go to the Wallet section to see available rewards. Select the reward you want to redeem and follow the instructions. FitCoins will be automatically deducted from your balance."
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about FitScore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support Options</CardTitle>
          <CardDescription>
            Choose how you'd like to get help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <HelpCircle className="mr-2 h-4 w-4" />
            Visit Help Center
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Video className="mr-2 h-4 w-4" />
            Watch Tutorial Videos
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="mr-2 h-4 w-4" />
            Live Chat with Support
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            Send us a message and we'll get back to you as soon as possible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                name="subject" 
                placeholder="What's your question about?" 
                value={contactForm.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="Please describe your issue in detail"
                rows={5}
                value={contactForm.message}
                onChange={handleInputChange}
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSubmit} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HelpSupport;
