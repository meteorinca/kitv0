# Scale 0 — The Spark
*From Electromagnetism to the First Instruction*

> *Before anything runs, something has to move.*

Hopefully, you got Paulbot the dogbot working and runnin' around.

Now let's get a bit deep into the inner workings of how this all comes together. 

> "If you wish to make an apple pie from scratch, you must first invent the universe." - Carl Sagan

We have to start from the ultimate question. What is the nature of the universe we live in? 

According to our current understanding, there are 4 fundamental forces in the universe. Gravity, electromagnetism, the strong nuclear force, and the weak nuclear force. 


![Four fundamental forces of the universe](images/four_forces.png)

For our purposes, we are only concerned with the force of electromagnetism. 

---

## 1. See It Before You Know It
*Electricity and Electric fields*

Electric fields are all around us. Here's a short video showing static electricity:

::video[Professor shows static Electricity](videos/staticelectricitydemo.mp4)

In the video, the professor was able to float one object using static electricity by just manipulating electrons!
You can recreate this experiment but there's an easier way to see the force in action.

Here's a demo you can do at home:

::video[How to bend water with static electricity](videos/bendingwater.mp4)

Rub a balloon on your hair. Hold it near a thin stream of water from a tap. You will notice the water stream bends toward the balloon!

That bending is not magic (well, maybe a bit!) It is the same force (or field, depending on how you look at it) that runs every computer on Earth: **electromagnetism**.

::image[Charged Balloon deflecting a stream of water](images/waterballoon.jpg)

The balloon steals electrons from your hair, becoming negatively charged. The water molecules, which are slightly positive on one side and negative on the other, are attracted to that charge (as seen in the image). An invisible force field reaches across space and bends a liquid. This is the universe’s fundamental messaging system: charge in motion.

This is how computing begins: with charge, and what charge does.

---

## 2. From little electrons to big computers

Now that we know for sure that electric fields are real and all around us, let's get into how we use them to make computers.

Let's start with a bit of history. The oldest known mechanical computer is believed to be the Antikythera mechanism, discovered in a shipwreck off the coast of Greece in 1901. It is an ancient Greek analog computer designed to calculate the positions of planets and predict eclipses. It is older than 2000 years!

::video[How the Antikythera mechanism works](videos/antikythera.mp4)

So humans have been using levers and gears to make computing devices for over 2000 years. But that's all mechanical. How do we use electromagnetism to make computers?

Think of electricity as water flowing through pipes. A computer uses electric current to control the flow of "water" through a circuit. By controlling the flow of electricity, we can create on/off switches that can be used to perform calculations.

### Binary

Now since the best way to use electricity is in controlled bursts (on/off), humans created a way of thinking about numbers that could be represented in two states: binary. Think of it like you can hold up to ten fingers (base-10) but if you had one finger it could only represent two states: off or on. Let's call that 0 and 1. A '0' is off and a '1' is on.

> **Note**: A feature of Mathematics is that whatever math you can do using ten digits (which is 0 to 9 called base-10) you can do using only two digits (0 and 1 called base-2). It just takes longer to write. For example, writing the number 3458 in base-10 is written as 110110010010 in base-2. And 2x2=4 is 11x11=100 in base-2.

The fundamental concept behind this arrangement is the **binary system**, a base-2 numeral system that uses only two symbols: 0 and 1. These binary digits, or **bits**, are the basic building blocks of all digital information.

| Number (Base-10) | Number (Base-2) | Binary Representation |
|------------------|-----------------|---------------------|
| 0                | 0               | 0                   |
| 1                | 1               | 1                   |
| 2                | 2               | 10                  |
| 3                | 3               | 11                  |
| 4                | 4               | 100                 |
| 5                | 5               | 101                 |
| 6                | 6               | 110                 |
| 7                | 7               | 111                 |
| 8                | 8               | 1000                |

### Exercise time

Can you figure out an algorithm (or an exact set of steps) that could be used to take in any number (in base-10) and write it in binary?

Hint: 
Take the number
if number is 0. You are done.
while the number remains greater than 0, keep doing the following:
    If the number is odd, 
        write 1
    If the number is even, 
        write 0
    Cut the number in half
    Go back to the start of the while loop
Read the written bits backward

To get binary to do math with big numbers, we needed lots of on/off switches. We're talking millions, and eventually billions of them!

## The invention of the transistor

This is where one of the most important inventions of all time comes in: the transistor! 

![Transistor](images/transistor.jpg)

It is a much fancier and much much smaller on/off switch. How small is it?

In a modern smartphone, the transistors are 10,000 times smaller than a single strand of your hair!
And there are more than 50 billion transistors on a chip the size of your fingernail!

## Breadboard Exercise

Let's make a simple circuit on our breadboard to show that the on/off switch and transistors are the same.
First wire up the board so you can control the LED with the button as shown.
Then wire the transistor so you can control the LED with the button as shown. You will notice that it works the same way. Now for the interesting part, can we use the transistor to create an opposite finder? Basically if buttons is pressed, instead of led on, led turns off and if button is not pressed, led turns on.

Congratulations. You just built the first logic gate called the NOT gate (also known as an inverter).
What is it's algorithm?

Hint: If I sees 1, I say 0. If I sees 0, I say 1.

[Will add diagram]



## 📖 The Substitute Teacher (What Is a Computer?)

Imagine a substitute teacher walks into a class they know nothing about. They have no idea what the lesson is. But they have a **class manual** — a binder with step-by-step instructions.

> *"If the class is quiet, say 'Thank you.' If a student raises a hand, call on them. If the bell rings, dismiss the class."*

That substitute teacher is a CPU. The class manual is a program. The students are data.

A computer is not smart. It follows a manual — precisely, obediently, incredibly fast. Every game, every website, every AI you've used was written as instructions in a manual that a "substitute teacher" followed, step by step, billions of times per second.

![A magnifying glass revealing a circuit board, wires spreading outward like a map](images/scale0_computer.png)

---

## ⚡ What Electromagnetism Has to Do With It

Inside every computer chip, transistors act like tiny on/off switches. A transistor is about **5–7 nanometers** wide — roughly 10,000 times thinner than a human hair.

A modern processor holds **over 10 billion** of them.

Each transistor switches on or off using a tiny electrical charge. On = 1. Off = 0. Binary.

**The chain of scale:**

| What | Size | Why It Matters |
|------|------|----------------|
| Electron | 0.00001 nm | Carries the charge |
| Transistor | 5–7 nm | The on/off switch |
| CPU Core | ~1 cm | Billions of transistors |
| Microcontroller | ~3 cm chip | A full computer on one chip |
| Your program | Invisible | Tells all of it what to do |

A lightning bolt and a Google search use the same fundamental force. One is uncontrolled. One is choreographed at 5 GHz.

---

## 🛠 Guided Build: Your First Program in Plain English

Before you write code, write logic. Here is a real program — in English:

```
Start.
Check: Is the temperature above 80°F?
  → YES: Turn the fan on.
  → NO: Keep the fan off.
Wait 1 minute.
Repeat.
```

This is it. This is programming. Everything else — Python, JavaScript, C++ — is just a way to say this in a language a substitute teacher (the CPU) can read.

**Your turn:** Write a program in plain English that:
1. Checks if it is past 9pm.
2. If yes: turns the lights dim.
3. If no: keeps them bright.
4. Repeats every 10 minutes.

There is no "wrong" answer yet. There is only clear thinking.

---

## 🎨 Remix Challenge

Take your plain-English program and change one rule:
- What if it checks *noise level* instead of *time*?
- What if it controls *music volume* instead of *lights*?
- What if it repeats every 1 second instead of 10 minutes?

You just wrote three new programs. None required a keyboard. All required a brain.

---

## Scale Comparison

> One line of code you write → compiled into thousands of instructions → executed by billions of transistors → powered by electromagnetism → revealed by a bent stream of water from a balloon.

*That is the scale of what you just started learning.*
