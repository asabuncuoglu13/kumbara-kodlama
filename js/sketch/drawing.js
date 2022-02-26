/**
 * Class-based instance mode setup
 * This uses properties instead of building everything in the constructor
 */
class Sketch {
    /** Constructor to setup the p5 calls
     * @param {p5} p: the P5 object
     * @param {object} setup_arguments: setup settings
     * @param {object} colors: color settings
     * @param {object} inverted: inverted color settings
     */
    constructor(p, setup_arguments, colors, inverted) {
        this._reset = null;
        this._p = null;
        this.setup_arguments = setup_arguments;
        this.colors = colors;
        this.inverted = inverted;
        this.p = p;
    }

    /**
     * creates the closure to create the p5 canvas
     * This is so we have access to our 'this'
     */
    get setup() {
        let self = this;
        return function(){
            self.p.createCanvas(
                $("#" + self.setup_arguments.parent_id).outerWidth(true),
                self.setup_arguments.height);
            self.p.strokeWeight(self.setup_arguments.stroke_weight);
            self.reset();
        };
    }

    /**
     * creates the closure to handle a mouse press
     */
    get mouse_pressed() {
        let self = this;
        return function() {
            self.p.background(self.inverted.background);
            self.p.fill(self.inverted.fill);
            self.p.stroke(self.inverted.stroke);
        };
    }

    /**
     * closure to handle a mouse release
     */
    get mouse_released() {
        let self = this;
        return function() {
            self.reset();
        };
    }

    /**
     * creates the closure for the default setup
     */
    get reset() {
        let self = this;
        if (self._reset === null){
            self._reset = function() {
                self.p.background(self.colors.background);
                self.p.fill(self.colors.fill);
                self.p.stroke(self.colors.stroke);
            };
        }
        return self._reset;
    }

    /**
     * creates closure to draw circles that change diameter
     * based on mouse speed
     **/
    get draw() {
        var self = this;
        return function(){
            var diameter;
            /* get the distance from last click, raise to 1.5 */
            diameter = self.p.pow(self.p.dist(self.p.pmouseX,
                self.p.pmouseY,
                self.p.mouseX,
                self.p.mouseY), 1.5);
            /* move the ellipse using the new diameter */
            self.p.ellipse(self.p.mouseX, self.p.mouseY, diameter, diameter);
        };
    } // end draw

    /**
     * the P5 object with our methods
     */
    get p() {
        return this._p;
    } // end get p

    /**
     * sets up the P5 object with our methods
     * @param {P5} original: the P5 object
     */
    set p(original) {
        this._p = original;
        this._p.draw = this.draw;
        this._p.setup = this.setup;
        this._p.mousePressed = this.mouse_pressed;
        this._p.mouseReleased = this.mouse_released;
    } // end set p
} // end Sketch

/** Settings objects **/
let COLOR = [50, 0, 255];
let WHITE = 255;

let setup_arguments = {
    stroke_weight: 3,
    height: 200,
    parent_id: "class-based-instance-mode"
}

let inverted_colors = {
    background: COLOR,
    fill: COLOR,
    stroke: WHITE,
    height: 50
}

let default_colors = {
    background: WHITE,
    fill: WHITE,
    stroke: COLOR
}

/** Build the code **/

function builder(p) {
    sketch = new Sketch(p, setup_arguments, default_colors, inverted_colors);
}

var sketch = new p5(builder, setup_arguments.parent_id);