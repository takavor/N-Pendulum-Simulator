# N-Pendulum Simulator

This is a simulation of multiple pendulums swinging from an anchor point using Verlet integration. Rods connecting masses may be set to be either stiff or springy. Collisions between surfaces, such as walls and individual masses, have also been implemented. Dragging the masses with the mouse causes a disturbance and makes them move, displaying the chaotic nature of a system with multiple pendulums.

## Installation

To run the simulation, clone the repository or download the project ZIP. Open the `index.html` file to start the simulation.
```linux
git clone https://github.com/takavor/N-Pendulum-Simulator.git
cd N-Pendulum-Simulator
```

## Demo

### Double pendulum (stiff and springy)
<div>
	<a href="https://gyazo.com/42417df7e9901028daeb07bab5066182"><img src="https://i.gyazo.com/42417df7e9901028daeb07bab5066182.gif" alt="Image from Gyazo" width="400"/></a>
	<a href="https://gyazo.com/98039492b59edcbb097da933d23ae569"><img src="https://i.gyazo.com/98039492b59edcbb097da933d23ae569.gif" alt="Image from Gyazo" width="400"/></a>
</div>

### Stiff rod multiple pendulum systems (undisurbed and disturbed)
<div>
	<a href="https://gyazo.com/1388407c0e0688b3ac9008f889f4f903"><img src="https://i.gyazo.com/1388407c0e0688b3ac9008f889f4f903.gif" alt="Image from Gyazo" width="400"/></a>
	<a href="https://gyazo.com/71484bfb6dc863ecff358e0c768bc82d"><img src="https://i.gyazo.com/71484bfb6dc863ecff358e0c768bc82d.gif" alt="Image from Gyazo" width="400"/></a>
</div>

### More disturbed springy pendulum systems
<div>
	<a href="https://gyazo.com/89473059a39770bbec66d807174742a0"><img src="https://i.gyazo.com/89473059a39770bbec66d807174742a0.gif" alt="Image from Gyazo" width="400"/></a>
	<a href="https://gyazo.com/3e5ceffc52c8133183753f9a50c7ae08"><img src="https://i.gyazo.com/3e5ceffc52c8133183753f9a50c7ae08.gif" alt="Image from Gyazo" width="400"/></a>
</div>

## Verlet Integration

Verlet integration was used for simulating the movements. The velocity of a mass in the current frame is the difference of the position of the mass in the current frame and its position in the previous frame:

<img src="https://latex.codecogs.com/svg.image?{v_{current}}^{}=&space;s_{current}&space;-&space;{}s_{previous}" title="{v_{current}}^{}= s_{current} - {}s_{previous}" />

`v` is the velocity vector of the mass, and `s` is the position vector. At each frame, the velocities of the masses are calculated, and the old and new positions of the masses are updated. Other forces, such as constraints between masses, dampening, and gravity, are also accounted for in the calculation.

