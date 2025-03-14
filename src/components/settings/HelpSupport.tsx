
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, MessageSquare, ExternalLink } from "lucide-react";

const supportFormSchema = z.object({
  subject: z.string({
    required_error: "Please select a subject.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

const defaultValues: Partial<SupportFormValues> = {
  subject: "",
  description: "",
  email: "",
};

const HelpSupport = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues,
  });

  function onSubmit(data: SupportFormValues) {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(data);
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
      setIsLoading(false);
    }, 1000);
  }

  const faqs = [
    {
      question: "How do I track my workouts?",
      answer: "You can track your workouts by going to the Dashboard and clicking on the 'Add Workout' button. You can also connect your fitness tracker for automatic tracking."
    },
    {
      question: "How do I join a challenge?",
      answer: "Go to the Challenges tab and browse available challenges. Click on any challenge card to view details and join the challenge."
    },
    {
      question: "Can I connect multiple fitness trackers?",
      answer: "Yes, you can connect multiple fitness trackers. Go to Settings > General and toggle on the fitness services you want to connect."
    },
    {
      question: "How are FitScore points calculated?",
      answer: "FitScore points are calculated based on your activity intensity, duration, and consistency. The more active you are, the higher your score."
    },
    {
      question: "How do I redeem rewards?",
      answer: "You can redeem rewards in the Wallet section. Click on available rewards and follow the redemption instructions."
    },
  ];

  const resources = [
    { name: "User Guide", url: "#" },
    { name: "Video Tutorials", url: "#" },
    { name: "Community Forum", url: "#" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
        </div>
        
        <Card className="p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left py-3">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Contact Support</h3>
        </div>
        
        <Card className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="payment">Payment & Billing</SelectItem>
                        <SelectItem value="technical">Technical Problems</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll use this email to respond to your inquiry.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe your issue in detail..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Additional Resources</h3>
        </div>
        
        <Card className="p-4">
          <div className="grid gap-2">
            {resources.map((resource, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="justify-start" 
                onClick={() => window.open(resource.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {resource.name}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpSupport;
