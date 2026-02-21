import { MapPin, Clock, Shield, Star, ChefHat, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();
    const [currentFeature, setCurrentFeature] = useState(0);
    const [orderAnimation, setOrderAnimation] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        // Rotate through features
        const featureInterval = setInterval(() => {
            setCurrentFeature(prev => (prev + 1) % 3);
        }, 4000);

        return () => clearInterval(featureInterval);
    }, []);

    const handleOrderNow = () => {
        setOrderAnimation(true);
        setTimeout(() => {
            setOrderAnimation(false);
            navigate('/login');
        }, 1000);
    };

    const features = [
        {
            icon: <Clock className="text-orange-500" size={32} />,
            title: "Lightning Fast Delivery",
            description: "Average delivery time of 25 minutes",
            highlight: "25 min"
        },
        {
            icon: <Shield className="text-green-500" size={32} />,
            title: "Quality Guaranteed",
            description: "Fresh ingredients from trusted partners",
            highlight: "100% Fresh"
        },
        {
            icon: <MapPin className="text-blue-500" size={32} />,
            title: "Wide Coverage",
            description: "Serving 50+ locations across the city",
            highlight: "50+ Areas"
        }
    ];

    const stats = [
        { number: "50K+", label: "Happy Customers" },
        { number: "200+", label: "Restaurant Partners" },
        { number: "25 min", label: "Avg. Delivery Time" },
        { number: "4.8★", label: "Customer Rating" }
    ];

    const cuisines = [
        { emoji: "🍕", name: "Italian", color: "bg-red-100 text-red-700" },
        { emoji: "🍛", name: "Indian", color: "bg-orange-100 text-orange-700" },
        { emoji: "🍔", name: "American", color: "bg-yellow-100 text-yellow-700" },
        { emoji: "🍜", name: "Asian", color: "bg-green-100 text-green-700" },
        { emoji: "🥗", name: "Healthy", color: "bg-emerald-100 text-emerald-700" },
        { emoji: "🍰", name: "Desserts", color: "bg-pink-100 text-pink-700" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <ChefHat className="text-white" size={18} />
                        </div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">QuickBite</h1>
                    </div>

                    <nav className="hidden md:flex space-x-8 text-gray-600">
                        <a href="#" className="hover:text-orange-500 transition-colors">Menu</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Restaurants</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">About</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Contact</a>
                    </nav>

                    <button
                        onClick={() => navigate('/login')}
                        className="cursor-pointer bg-orange-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                    >
                        Sign In
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                            Delicious Food
                            <span className="block text-orange-500">Delivered Fast</span>
                        </h2>

                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Experience the finest cuisines from your favorite restaurants, delivered fresh to your doorstep with our premium delivery service.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={handleOrderNow}
                                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${orderAnimation
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30'
                                    }`}
                            >
                                {orderAnimation ? '✓ Redirecting...' : 'Order Now'}
                            </button>

                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-orange-500 hover:text-orange-500 transition-all duration-300"
                            >
                                View Menu
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center lg:text-left">
                                    <div className="text-2xl font-bold text-gray-800">{stat.number}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Dynamic Feature Display */}
                    <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">

                            {/* Feature Tabs */}
                            <div className="flex space-x-2 mb-8">
                                {features.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFeature(index)}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${currentFeature === index
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Feature {index + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Current Feature */}
                            <div className="text-center transition-all duration-500">
                                <div className="mb-6 flex justify-center">
                                    {features[currentFeature].icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                    {features[currentFeature].title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {features[currentFeature].description}
                                </p>
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <div className="text-3xl font-bold text-orange-500">
                                        {features[currentFeature].highlight}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cuisines Section */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            Explore Cuisines
                        </h3>
                        <p className="text-gray-600 text-lg">
                            From local favorites to international delights
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {cuisines.map((cuisine, index) => (
                            <div
                                key={index}
                                className={`${cuisine.color} rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
                            >
                                <div className="text-4xl mb-3">{cuisine.emoji}</div>
                                <div className="font-semibold">{cuisine.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            How It Works
                        </h3>
                        <p className="text-gray-600 text-lg">
                            Simple steps to satisfy your cravings
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Choose", desc: "Browse restaurants and select your favorite dishes", icon: "🍽️" },
                            { step: "2", title: "Order", desc: "Place your order and make secure payment", icon: "📱" },
                            { step: "3", title: "Enjoy", desc: "Relax while we deliver fresh food to your door", icon: "🚚" }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                    {item.step}
                                </div>
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
                <div className="max-w-4xl mx-auto px-6 text-center text-white">
                    <h3 className="text-4xl font-bold mb-4">
                        Ready to Order?
                    </h3>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of satisfied customers and experience the best food delivery service
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white text-orange-500 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-500 transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <ChefHat className="text-white" size={16} />
                                </div>
                                <h4 className="text-xl font-bold">QuickBite</h4>
                            </div>
                            <p className="text-gray-400">
                                Premium food delivery service bringing the best restaurants to your doorstep.
                            </p>
                        </div>

                        <div>
                            <h5 className="font-semibold mb-4">Quick Links</h5>
                            <div className="space-y-2 text-gray-400">
                                <div className="cursor-pointer hover:text-white">About Us</div>
                                <div className="cursor-pointer hover:text-white">Menu</div>
                                <div className="cursor-pointer hover:text-white">Restaurants</div>
                                <div className="cursor-pointer hover:text-white">Contact</div>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-semibold mb-4">Support</h5>
                            <div className="space-y-2 text-gray-400">
                                <div className="cursor-pointer hover:text-white">Help Center</div>
                                <div className="cursor-pointer hover:text-white">Track Order</div>
                                <div className="cursor-pointer hover:text-white">Cancellation</div>
                                <div className="cursor-pointer hover:text-white">Refund Policy</div>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-semibold mb-4">Contact Info</h5>
                            <div className="space-y-2 text-gray-400">
                                <div>📞 +1 (555) 123-4567</div>
                                <div>✉️ support@quickbite.com</div>
                                <div>📍 123 Food Street, City</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 QuickBite. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
