// require modules
const express       = require('express'),
      app           = express(),
      bodyParser    = require('body-parser'), 
      mongoose      = require('mongoose'),
      seedDB        = require('./seeds'),
      Comment       = require('./models/comment'),
      Campground    = require('./models/campground');

// setup mongoose
mongoose.connect('mongodb://localhost/yelp_camp', { useMongoClient: true });

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// seed data
// seedDB();

/* Routes */
app.get('/', (req, res) => {
    res.render('landing');
});

// INDEX - displays all campgrounds
app.get('/campgrounds', (req, res) => {
    Campground.find({}, (err, campgrounds) => {
        if(err) throw err;
        res.render('campgrounds/index', { campgrounds: campgrounds });
    });
});

// NEW - diplays a form to create a new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// CREATE - create a new campground and add it to database
app.post('/campgrounds', (req, res) => {
    // get data from form and add to campgrounds array
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let newCampground = { 
        name: name, 
        image:image, 
        description: description 
    };

    // create an entry
    Campground.create(newCampground, (err, saveCampground) => {
        if(err) throw err;
        console.log("Save Successful");
        // redirect to campgrounds
        res.redirect('/campgrounds');
    });
});

// SHOW - displays information of one campground
app.get('/campgrounds/:id', (req, res) => {
    // find campground by id
    Campground.findById(req.params.id).populate('comments').exec((err, campground) => {
        if(err) throw err;
        console.log(campground);
        // render show page
        res.render('campgrounds/show', { campground: campground });
    });
});

// ======================
// COMMENTS ROUTES
// ======================

app.get('/campgrounds/:id/comments/new', (req, res) => {
    // find campground
    Campground.findById(req.params.id, (err, campground) => {
        if (err) throw err;
        res.render("comments/new", { campground: campground });
    });
});

app.post('/campgrounds/:id/comments', (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err); 
            res.redirect('/campgrounds'); 
        } else {
            // create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) throw err;
                campground.comments.push(comment);
                campground.save((err, comment) => { if (err) throw err; });
                // redirect to show page
                res.redirect('/campgrounds/' + campground._id);
            });
        }
    });
});

// Server Setup
app.listen(3000, () => {
    console.log(`Server started on 3000`);
});