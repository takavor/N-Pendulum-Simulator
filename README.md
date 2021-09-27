# N-Pendulum Simulator

This is a simulation of multiple pendulums swinging from an anchor point using Verlet integration. Rods connecting masses may be set to be either stiff or springy, causing different movements in the animation. Collisions between surfaces, such as walls and individual masses, have also been implemented. Dragging the masses with the mouse causes them to move, showing the chaotic nature of a multiple pendulum system.

## Running the Simulation

To run the simulation, clone the repository or download the project ZIP. Open the `index.html` file to start the simulation.
```linux
	clone https://github.com/takavor/N-Pendulum-Simulator.git
	cd N-Pendulum-Simulator
```

## Demo



## Verlet Integration

I decided to use Verlet integration for simulating the movements. This method allows for the calculation of the velocity of the current frame based on the position variables of the mass. The velocity of a mass on a given frame is:

<img src="https://latex.codecogs.com/svg.image?{v_{current}}^{}=&space;s_{current}&space;-&space;{}s_{previous}" title="{v_{current}}^{}= s_{current} - {}s_{previous}" />

where `v` is the velocity vector of the mass, and `s` is the position vector. At each frame, the velocity of the mass is calculated, and the old and new positions of the mass are updated. Other forces, such as constraints between masses, dampening, and gravity, are also accounted for in the calculation. 

