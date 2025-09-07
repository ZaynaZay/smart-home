import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Zap, BrainCircuit, Settings, CheckCircle, Quote } from "lucide-react";

const HomePage = () => {
  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-12">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
          Tune Your Environment to Your Emotions
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          An intelligent wellness assistant that uses AI to detect your mood and
          adapt your digital space to enhance your well-being.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
        <p className="mt-2 text-muted-foreground">
          A seamless experience from detection to action.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-6 border rounded-xl bg-card transition-transform hover:scale-105 hover:shadow-lg">
            <Zap className="h-10 w-10 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Real-time Detection</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Uses your webcam to intelligently analyze and understand your
              emotional state in real-time.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 border rounded-xl bg-card transition-transform hover:scale-105 hover:shadow-lg">
            <BrainCircuit className="h-10 w-10 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Adaptive Environment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Automatically adjusts your laptop's theme, music, and more to
              create a responsive atmosphere.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 border rounded-xl bg-card transition-transform hover:scale-105 hover:shadow-lg">
            <Settings className="h-10 w-10 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Deep Personalization</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Customize exactly how the app responds to your emotions. You are
              in full control of your digital wellness.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Loved by Users Worldwide
        </h2>
        <p className="mt-2 text-muted-foreground">
          See what people are saying about their new-found focus.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Quote className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="italic">
                "WellnessHub has completely changed my work-from-home routine.
                When I start feeling stressed, the subtle shift in music and
                wallpaper is a game-changer."
              </p>
              <p className="mt-4 font-semibold">- Sarah J, Developer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Quote className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="italic">
                "I never realized how much my digital environment affected my
                mood. This app is like magic. It helps me stay calm and focused
                during long study sessions."
              </p>
              <p className="mt-4 font-semibold">- Michael B, Student</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <Quote className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="italic">
                "The analytics dashboard is fascinating! Seeing my emotional
                patterns throughout the week has given me incredible insight
                into my own well-being."
              </p>
              <p className="mt-4 font-semibold">
                - Dr. Emily Carter, Researcher
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-2 text-muted-foreground">
          Get started today, completely free.
        </p>
        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Hobby Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-4xl font-bold">
                Free{" "}
                <span className="text-lg font-normal text-muted-foreground">
                  / forever
                </span>
              </p>
              <ul className="space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />{" "}
                  Real-time Emotion Detection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Basic
                  Laptop Control
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />{" "}
                  Personal Dashboard
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />{" "}
                  Community Support
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link to="/signup">Start Your Journey Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full mt-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is my webcam data secure?</AccordionTrigger>
            <AccordionContent>
              Absolutely. Your privacy is our top priority. All image processing
              happens in a secure backend environment, and we never store your
              camera footage.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              What operating systems are supported?
            </AccordionTrigger>
            <AccordionContent>
              Currently, our local agent is optimized for Debian-based Linux
              distributions like MX Linux, Ubuntu, and Pop!_OS. We are working
              on expanding support to Windows and macOS.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I customize the actions?</AccordionTrigger>
            <AccordionContent>
              Yes! The core of WellnessHub is personalization. Our settings
              panel allows you to create detailed rules, linking specific
              emotions to your preferred wallpapers, music playlists, and more.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default HomePage;
