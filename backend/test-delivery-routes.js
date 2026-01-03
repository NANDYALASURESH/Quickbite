const r = require('./routes/delivery.routes');
console.log('Type:', typeof r);
console.log('Is Router:', r.name === 'router');
console.log('Has stack:', r.stack ? 'yes' : 'no');
if (r.stack) {
    console.log('Stack length:', r.stack.length);
    r.stack.forEach((layer, i) => {
        if (layer.route) {
            console.log(`Route ${i}:`, layer.route.path, Object.keys(layer.route.methods));
        }
    });
}
