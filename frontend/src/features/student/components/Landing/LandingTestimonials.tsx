import { AnimatedTestimonials } from "../../../../shared/components/ui/animated-testimonials";

export default function LandingTestimonials() {
    const testimonials = [
        {
            quote:
                "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
            name: "Kailas Patil",
            designation: "Dean - Vishwakarma University",
            src: "/testimonials/kailas.png",
        },
        {
            quote:
                "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
            name: "Pavitha Nooji",
            designation: "Associate Dean - Vishwakarma University",
            src: "/testimonials/pavitha.png",
        },
        {
            quote:
                "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
            name: "Sujal Gundlapelli",
            designation: "ML Engineer - ARC",
            src: "/testimonials/sujal.png",
        },
        {
            quote:
                "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
            name: "Abhijit Karji",
            designation: "President - ARC",
            src: "/testimonials/abhijit.png",
        },
        {
            quote:
                "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
            name: "Samarth Ratnaparkhi",
            designation: "Mobile App Developer",
            src: "/testimonials/samarth.png",
        },
    ];
    return <AnimatedTestimonials testimonials={testimonials} />;
}
