# Air vs Vacuum Fall Simulator

## About the Project

This is a physics based web simulation project where we can compare how objects fall in **air vs vacuum**.

In normal thinking many people think heavier objects fall faster, but actually in vacuum all objects fall same speed. So this project is made to visualize that concept clearly.

This project also allow to test different planets gravity like Earth, Moon, Mars and Jupiter which makes it more interesting.

---

## Features

* Simulation of falling objects in **Air and Vacuum**

* In vacuum both objects fall with same acceleration (fixed logic)

* In air, objects behave differently based on drag

* Option to select planets:

  * Earth
  * Moon
  * Mars
  * Jupiter

* Real time telemetry showing:

  * Velocity
  * Height
  * Acceleration
  * Time elapsed
  * Landing state

* Objects are not hardcoded, instead reusable data is used with drag coefficients

* End of simulation gives explanation based on selected setup

* Responsive design so it can also run in mobile devices

---

## How it Works

In **vacuum condition**:

* No air resistance is applied
* Both objects fall using same acceleration (g)
* Kinematic equations are used for accurate motion

In **air condition**:

* A simple air model is used:

  a_eff = g * (1 - Cd)

* Higher drag coefficient (Cd) means slower falling object

This is not 100% real physics but simplified model for understanding

---

## Technologies Used

* HTML
* CSS
* JavaScript

No external libraries used, everything is done using basic concepts

---

## What I Learned

* How physics formulas can be applied in real time simulation
* Difference between air resistance and vacuum motion
* Writing reusable object structures instead of hardcoding
* Making UI responsive for different screen sizes
* Handling real time updates (telemetry)

---

## How to Run

1. Download or clone the project
2. Open `index.html` in browser
3. Select:

   * Planet
   * Environment (Air / Vacuum)
   * Objects
4. Click on Drop button

---

## Future Improvements

* Add more realistic air resistance formula
* Add graphs for velocity vs time
* Add more objects
* Improve UI animations

---

## Note

This project is made for learning purpose, so physics is slightly simplified and not fully accurate.

---

## Author

Student project

---
