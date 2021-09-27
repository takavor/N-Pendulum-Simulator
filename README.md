# N-Pendulum Simulator

This is a simulation of multiple pendulums swinging from an anchor point using Verlet integration. Rods connecting masses may be:
* Stiff rods
* Spring rods,
each displaying different physical behaviours. Collisions between surfaces, such as walls and individual masses, have also been implemented.

## Installation

To run the simulation, clone the repository or download the project ZIP. Open the `index.html` file to start the simulation.

## Verlet Integration

I decided to use Verlet integration for simulation the movements of the masses. Instead of integrating on the basis of a time variable, this method allows the calculation of the velocity based on the position variables of a given frame. The velocity components on a given frame is:

<img src="https://latex.codecogs.com/svg.latex?\Large&space;x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}" title="\Large x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}" />

## Demo