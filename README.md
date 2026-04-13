# Pumping Lemma Demonstration Tool for Regular Languages

An interactive, web-based educational simulator designed to visualize and prove the Pumping Lemma for Regular Languages. Its primary objective is to allow users to interactively construct strings, partition them according to lemma conditions, and dynamically "pump" (duplicate or remove) a specific substring to observe whether the resulting string remains within the constraints of a target language. The tool serves as a practical medium for demonstrating how certain languages fail the Pumping Lemma, thereby disproving their regularity.


## Feature Breakdown
### 1. Target Language Configuration Options
The tool supports dynamic language generation and validation to allow for varied demonstrations. Users can interactively switch between language paradigms:

**Pre-defined Non-Regular Languages**: Built-in templates such as $a^n b^n$, $a^n b^{2n}$, and $a^n b^{3n}$ highlight standard textbook examples of non-regularity.
**Pre-defined Regular Language**: A template for $a^n b^m$ is included to demonstrate a scenario where the Pumping Lemma conditions can successfully be met.
**Custom Formal Formula Input**: Users can construct custom algebraic formal languages (e.g., a^n b^(2n) or 0^n 1^m), providing granular control over the constraints. The simulator actively parses and evaluates algebraic expressions to determine character repetition.
**Custom Regex Pattern**: Users can inject standard regular expressions (e.g., (a+b)*a) and provide arbitrary custom strings to test against the expression.


### 2. Parameter Control and Initial Condition Validation
The tool utilizes range sliders to define the pumping length parameter ($p$) and subsequent algebraic parameters (like $m$).

Upon configuration, the simulator generates a base string $s$.
The system actively monitors the Initial Condition ($|s| \ge p$). If the underlying string does not meet this length restriction, it halts the simulator, triggers an error state, and explicitly notifies the user through the interface until the condition is met.
### 3. Interactive String Partitioning ($s = xyz$)
Once a valid base string is instantiated, character sequences are rendered as discrete, manipulable graphical blocks.

Drag-and-Drop Selection: Users can click and drag across adjacent character blocks to designate the central substring $y$.
Visual Isolation: The string is instantaneously partitioned into three segments, uniquely color-coded and structurally separated:

$x$ (Prefix, Blue)

$y$ (Pumpable Substring, Purple)

$z$ (Suffix, Pink)

This explicit visual differentiation isolates the loop section from the static sequence.

### 4. Dynamic Pumping Control and Structural Validation
Once substring $y$ isolates, the "Pumping" phase becomes unlocked.

Users can manipulate the repetition count ($i$) of $y$ using specialized controls to "Pump $y$" ($i \ge 2$), "Remove $y$" ($i = 0$), or "Reset" ($i = 1$).
As the substring is dynamically duplicated or removed on screen, the simulator synchronously re-evaluates the resulting string ($s' = xy^iz$) against the structural constraints of the chosen target language.
Status indicators provide real-time boolean feedback indicating whether $s'$ is "Still in Language" or "Not in Language."

### 5. Real-Time Theorem Tracking and Proof Generation
The simulator provides a continuous map of user progression through the formal definition of the lemma.

Condition Tracking: The formal mathematical conditions ($|s| \ge p$, $|xy| \le p$, $|y| > 0$, and validity of $xy^iz \in L$) are tracked via an active checklist system. Conditions are dynamically flagged as passed (green) or failed (red) based on the user's current partition and pump count.
Automated Proof Synthesis: A pseudo-formal proof narrative automatically generates adjacent to the visualization. It structurally transcribes the user's specific partition coordinates, identifies the pumped string iteration, and formulates a mathematical conclusion on whether the current state contradicts the Pumping Lemma.

### 6. Multi-Pumping Matrix Analysis
To definitively prove a language is non-regular, one partition failing is not enough; all possible legal partitions where $|xy| \le p$ and $|y| > 0$ must fail.

The system features an Analyze All Valid Partitions (Multi-Pump) mechanism. This computationally generates a data matrix representing every valid partition configuration for the current string and parameters.
It systematically evaluates every configuration under the current pump count ($i$) and displays the structural outcomes side-by-side.
If the matrix detects that every configuration breaks the language rules, the system definitively outputs a macro-conclusion that the language is completely un-pumpable and, therefore, functionally proved to be not regular.

### 7. State Machine (DFA) Visualizer
An embedded, animated SVG State Machine reflects the conceptual transition logic tied to string navigation.

It consists of a start phase ($x$), a cyclical loop phase capturing the repetitive nature of $y$, and a terminal phase ($z$).
Upon executing a pump action, the nodes and edges contextually animate (pulse and light up), reinforcing the theoretical mapping of the visual blocks to deterministic finite automaton traversal.
