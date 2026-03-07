const userRoutes = require('./users.routes');
const brandRoutes = require('./brand.routes');
const categoryRoutes = require('./category.routes');
const carRoutes = require('./car.routes');
const chatRoutes = require('./chat.routes');
const testDriveRoutes = require('./testDrive.routes');
const depositRoutes = require('./deposit.routes');
const blogRoutes = require('./blog.routes');

function routes(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/brand', brandRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/car', carRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/test-drive', testDriveRoutes);
    app.use('/api/deposit', depositRoutes);
    app.use('/api/blog', blogRoutes);
    app.use('/api/dashboard', require('./dashboard.routes'));
    app.use('/api/contact', require('./contact.routes'));
    app.use('/api/chatbot', require('./chatbot.routes'));
}

module.exports = routes;
