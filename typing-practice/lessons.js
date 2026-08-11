// lessons.js — Unity C# API Reference + Practical Examples
// Each "API" lesson explains the method/property while you type it.
// Each "Example" lesson is a complete script you can paste directly into Unity.

const LESSONS = [

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 1 — MonoBehaviour API
    // ══════════════════════════════════════════════════════════════
    {
        id: 1,
        category: "MonoBehaviour API",
        title: "Lifecycle — Execution Order",
        description: "סדר הרצה מדויק של כל שיטות MonoBehaviour — מ-Awake ועד OnDestroy.",
        difficulty: 1,
        type: "api",
        code: `// MONOBEHAVIOUR — LIFECYCLE EXECUTION ORDER
// Unity calls these methods automatically, in THIS exact sequence.
using UnityEngine;

public class LifecycleOrder : MonoBehaviour
{
    // AWAKE — fires first, even when the script is disabled
    // cache GetComponent calls and set up internal state here
    void Awake() { Debug.Log("1 Awake"); }

    // ON ENABLE — fires every time this component is turned on
    // subscribe to C# events here (pair with OnDisable to unsubscribe)
    void OnEnable() { Debug.Log("2 OnEnable"); }

    // START — fires once, just before the first Update
    // safe to reference other objects here (all Awake calls are done)
    void Start() { Debug.Log("3 Start"); }

    // FIXED UPDATE — fires at a fixed interval (default: 50x per second)
    // ONLY use this for Rigidbody physics — never AddForce in Update
    void FixedUpdate() { }

    // UPDATE — fires every rendered frame (speed depends on frame rate)
    // use for input, non-physics movement, timers
    void Update() { }

    // LATE UPDATE — fires after ALL objects finish their Update
    // perfect for camera follow (the target already moved this frame)
    void LateUpdate() { }

    // ON DISABLE — fires when component is disabled or object destroyed
    // unsubscribe from events here to prevent memory leaks
    void OnDisable() { Debug.Log("7 OnDisable"); }

    // ON DESTROY — last call before the object is removed from memory
    void OnDestroy() { Debug.Log("8 OnDestroy"); }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 2 — Transform API
    // ══════════════════════════════════════════════════════════════
    {
        id: 2,
        category: "Transform API",
        title: "Transform — Position, Rotation, Scale",
        description: "כל מה שצריך לדעת על Transform — המרכיב שקיים על כל GameObject.",
        difficulty: 1,
        type: "api",
        code: `// TRANSFORM — every GameObject has one; controls where it lives in the world
using UnityEngine;

public class TransformAPI : MonoBehaviour
{
    void Start()
    {
        // position — world-space coordinates (X right, Y up, Z forward)
        transform.position = new Vector3(0f, 1f, 5f);

        // localPosition — position relative to the parent object
        transform.localPosition = Vector3.zero;

        // Translate — move by an offset each call (not teleport)
        // Space.Self = relative to own rotation | Space.World = world axes
        transform.Translate(Vector3.forward * 3f, Space.Self);

        // eulerAngles — rotation in degrees (X pitch, Y yaw, Z roll)
        transform.eulerAngles = new Vector3(0f, 90f, 0f);

        // Rotate — spin by degrees per call (cumulative, not set)
        transform.Rotate(Vector3.up, 45f, Space.World);

        // LookAt — instantly point this object's forward at a target
        Transform target = GameObject.Find("Enemy").transform;
        transform.LookAt(target);

        // forward, right, up — unit vectors in the object's local axes
        Vector3 ahead = transform.forward;
        Vector3 side = transform.right;

        // localScale — size multiplier (1 = normal, 2 = double size)
        transform.localScale = new Vector3(2f, 1f, 2f);

        // parent — which Transform owns this one in the hierarchy
        transform.SetParent(null); // null = make it a root object
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 3 — Rigidbody API
    // ══════════════════════════════════════════════════════════════
    {
        id: 3,
        category: "Rigidbody API",
        title: "Rigidbody — Forces, Mass, Velocity",
        description: "כל שיטות ה-physics של Rigidbody עם הסבר על כל ForceMode.",
        difficulty: 2,
        type: "api",
        code: `// RIGIDBODY — Unity's physics engine component
// Requires: Add Component > Physics > Rigidbody on your GameObject
using UnityEngine;

public class RigidbodyAPI : MonoBehaviour
{
    Rigidbody rb;

    void Awake()
    {
        // GetComponent — find the Rigidbody on THIS same GameObject
        rb = GetComponent<Rigidbody>();

        // mass — weight in kg (heavier = needs more force to accelerate)
        rb.mass = 2f;

        // drag — linear air resistance (0 = no drag, 5 = stops quickly)
        rb.drag = 0.3f;

        // angularDrag — rotational resistance (higher = spins slow down faster)
        rb.angularDrag = 0.05f;

        // useGravity — false lets objects float with no downward pull
        rb.useGravity = true;

        // isKinematic — true disables all physics; move via transform instead
        rb.isKinematic = false;

        // velocity — current movement speed and direction (world space)
        // setting this directly overrides all existing momentum
        rb.velocity = new Vector3(3f, 0f, 0f);

        // AddForce — push the object in a direction
        // ForceMode.Impulse      — instant hit, affected by mass (kick)
        // ForceMode.Force        — continuous push per second (engine)
        // ForceMode.Acceleration — continuous push, ignores mass
        // ForceMode.VelocityChange — instant push, ignores mass
        rb.AddForce(Vector3.up * 8f, ForceMode.Impulse);

        // AddTorque — apply rotational force (spin the object)
        rb.AddTorque(Vector3.up * 5f, ForceMode.Force);

        // MovePosition — teleport with collision checks (use in FixedUpdate)
        rb.MovePosition(transform.position + Vector3.forward * 0.1f);

        // constraints — lock specific axes from physics
        rb.constraints = RigidbodyConstraints.FreezeRotationX |
                         RigidbodyConstraints.FreezeRotationZ;
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 4 — Input API
    // ══════════════════════════════════════════════════════════════
    {
        id: 4,
        category: "Input API",
        title: "Input — Keyboard, Mouse, Axes",
        description: "Legacy Input system — GetKey, GetAxis, GetMouseButton ועוד.",
        difficulty: 1,
        type: "api",
        code: `// INPUT — Unity's legacy input system (Works without any setup)
// Edit > Project Settings > Input Manager to see/edit axis names
using UnityEngine;

public class InputAPI : MonoBehaviour
{
    void Update()
    {
        // GetKey — true EVERY frame the key is held down
        if (Input.GetKey(KeyCode.W)) Debug.Log("holding W");

        // GetKeyDown — true ONLY on the first frame the key is pressed
        if (Input.GetKeyDown(KeyCode.Space)) Debug.Log("jumped!");

        // GetKeyUp — true ONLY on the frame the key is released
        if (Input.GetKeyUp(KeyCode.Space)) Debug.Log("released space");

        // GetAxis — returns -1 to +1, smoothly (has acceleration/friction)
        // "Horizontal" = A/D or Left/Right arrow keys
        // "Vertical"   = W/S or Up/Down arrow keys
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        // GetAxisRaw — same as GetAxis but snaps to -1, 0, or +1 instantly
        // better for grid movement or when you don't want the smoothing
        float hRaw = Input.GetAxisRaw("Horizontal");

        // GetMouseButton — 0=left, 1=right, 2=middle
        if (Input.GetMouseButtonDown(0)) Debug.Log("left click!");

        // mousePosition — pixel coordinates of mouse (bottom-left = 0,0)
        Vector3 mousePos = Input.mousePosition;

        // GetMouseButtonDown returns true on click frame only (not held)
        bool clicked = Input.GetMouseButtonDown(1); // right click
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 5 — Physics Raycast API
    // ══════════════════════════════════════════════════════════════
    {
        id: 5,
        category: "Physics API",
        title: "Physics.Raycast — Hit Detection",
        description: "שליחת קרן בחלל והחזרת מידע על מה שנפגע — הבסיס של כל shooting ו-selection.",
        difficulty: 3,
        type: "api",
        code: `// PHYSICS.RAYCAST — fire an invisible line, detect the first thing it hits
using UnityEngine;

public class RaycastAPI : MonoBehaviour
{
    // LayerMask — bitmask that filters which layers the ray can hit
    // Assign in Inspector: drag layers you WANT to hit onto this field
    public LayerMask hitLayers;

    void Update()
    {
        // Ray — a starting point + direction (infinite length by default)
        Ray ray = new Ray(transform.position, transform.forward);

        // Also create a ray from the camera through the mouse cursor:
        // Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);

        // RaycastHit — struct that holds all info about what was hit
        RaycastHit hit;

        // Physics.Raycast — returns true if it hit something
        // signature: Raycast(ray, out hitInfo, maxDistance, layerMask)
        // 'out' means RaycastHit is filled in by the method for you
        if (Physics.Raycast(ray, out hit, 100f, hitLayers))
        {
            // hit.point — exact world position where the ray landed
            Debug.Log("Hit at: " + hit.point);

            // hit.normal — surface normal at impact (perpendicular to surface)
            Debug.DrawRay(hit.point, hit.normal, Color.green);

            // hit.distance — how far from ray origin to the hit point
            Debug.Log("Distance: " + hit.distance);

            // hit.transform — the Transform of the object that was hit
            Debug.Log("Hit object: " + hit.transform.name);

            // hit.collider — the Collider component that was hit
            Collider col = hit.collider;
        }

        // DrawRay — visualizes the ray in the Scene view (editor only)
        Debug.DrawRay(ray.origin, ray.direction * 100f, Color.red);
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 6 — Collider Callbacks API
    // ══════════════════════════════════════════════════════════════
    {
        id: 6,
        category: "Collider API",
        title: "Collider — Collision & Trigger Callbacks",
        description: "OnCollisionEnter vs OnTriggerEnter — מתי להשתמש בכל אחד.",
        difficulty: 2,
        type: "api",
        code: `// COLLIDER CALLBACKS — Unity calls these automatically on physics contact
// Collision vs Trigger:
//   Collision — solid objects that push each other (both need Collider)
//   Trigger   — one Collider has "Is Trigger" checked; objects pass through
//               but the callback fires. Used for zones, pickups, detection.
using UnityEngine;

public class ColliderCallbacks : MonoBehaviour
{
    // OnCollisionEnter — fires ONCE when this object physically touches another
    // 'collision' holds contact points, the other Rigidbody, impulse force
    void OnCollisionEnter(Collision collision)
    {
        // collision.gameObject — the other object we hit
        Debug.Log("Touched: " + collision.gameObject.name);

        // CompareTag — faster than .tag == "Player" (uses hash internally)
        if (collision.gameObject.CompareTag("Player"))
        {
            // relativeVelocity — impact speed (magnitude = how hard the hit was)
            float impactSpeed = collision.relativeVelocity.magnitude;
            Debug.Log("Impact speed: " + impactSpeed);
        }
    }

    // OnCollisionStay — fires EVERY frame while touching (use carefully, expensive)
    void OnCollisionStay(Collision collision) { }

    // OnCollisionExit — fires ONCE when objects separate
    void OnCollisionExit(Collision collision) { }

    // OnTriggerEnter — fires when an object enters the trigger zone
    // 'other' is the Collider of the entering object
    void OnTriggerEnter(Collider other)
    {
        Debug.Log("Entered trigger: " + other.name);
        other.GetComponent<PlayerHealth>()?.TakeDamage(10);
    }

    // OnTriggerExit — fires when an object leaves the trigger zone
    void OnTriggerExit(Collider other)
    {
        Debug.Log("Left trigger: " + other.name);
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 7 — Coroutine API
    // ══════════════════════════════════════════════════════════════
    {
        id: 7,
        category: "Coroutine API",
        title: "Coroutines — IEnumerator & yield",
        description: "קורוטינות — הדרך של Unity לעשות 'wait' בתוך קוד רגיל.",
        difficulty: 2,
        type: "api",
        code: `// COROUTINES — pause execution and resume later without blocking the game
// A coroutine is a method that can pause at 'yield' and resume next frame
using System.Collections;
using UnityEngine;

public class CoroutineAPI : MonoBehaviour
{
    void Start()
    {
        // StartCoroutine — launch a coroutine method
        StartCoroutine(MyRoutine());

        // Store the reference if you need to stop it later
        Coroutine handle = StartCoroutine(CountDown(5));

        // StopCoroutine — stop a specific coroutine by name or reference
        StopCoroutine(handle);

        // StopAllCoroutines — stop every coroutine on this MonoBehaviour
        StopAllCoroutines();
    }

    // IEnumerator — the return type of every coroutine method
    IEnumerator MyRoutine()
    {
        Debug.Log("Step 1");

        // yield return null — pause here, resume on the NEXT frame
        yield return null;

        Debug.Log("Step 2 — one frame later");

        // yield return new WaitForSeconds — pause for N real seconds
        yield return new WaitForSeconds(2f);

        Debug.Log("Step 3 — two seconds later");

        // yield return new WaitForFixedUpdate — resume after next FixedUpdate
        yield return new WaitForFixedUpdate();

        // yield return new WaitUntil — pause until condition becomes true
        yield return new WaitUntil(() => Input.GetKeyDown(KeyCode.Space));

        Debug.Log("Player pressed Space!");
    }

    IEnumerator CountDown(int from)
    {
        // coroutines can use loops — each iteration waits one second
        for (int i = from; i > 0; i--)
        {
            Debug.Log("T-minus: " + i);
            yield return new WaitForSeconds(1f);
        }
        Debug.Log("Launch!");
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 8 — Animator API
    // ══════════════════════════════════════════════════════════════
    {
        id: 8,
        category: "Animator API",
        title: "Animator — Controlling Animation States",
        description: "שליטה ב-Animator Controller דרך קוד — Set, Get, Trigger, Crossfade.",
        difficulty: 2,
        type: "api",
        code: `// ANIMATOR — controls the Animator Controller state machine from code
// Requires: GameObject with an Animator component + Animator Controller asset
using UnityEngine;

public class AnimatorAPI : MonoBehaviour
{
    Animator anim;

    void Awake()
    {
        anim = GetComponent<Animator>();
    }

    void Update()
    {
        // SetFloat — drive a Float parameter (like blend tree speed)
        // use this to smoothly blend between idle/walk/run animations
        float speed = GetComponent<Rigidbody>().velocity.magnitude;
        anim.SetFloat("Speed", speed);

        // Lerp the value for smoother transitions (avoids snapping)
        float current = anim.GetFloat("Speed");
        anim.SetFloat("Speed", Mathf.Lerp(current, speed, 0.1f));

        // SetBool — drive a Bool parameter (toggle states)
        bool grounded = Physics.Raycast(transform.position, Vector3.down, 0.1f);
        anim.SetBool("IsGrounded", grounded);

        // SetTrigger — fire a one-shot event (resets itself after use)
        // perfect for jump, attack, death — things that happen once
        if (Input.GetKeyDown(KeyCode.Space)) anim.SetTrigger("Jump");

        // SetInteger — drive an Integer parameter (state IDs, weapon index)
        anim.SetInteger("WeaponType", 2);

        // CrossFade — manually transition to a state by name
        // args: stateName, transitionDuration, layerIndex, normalizedTime
        anim.CrossFade("RunForward", 0.2f, 0);

        // GetCurrentAnimatorStateInfo — read what state is playing now
        AnimatorStateInfo info = anim.GetCurrentAnimatorStateInfo(0);
        bool isRunning = info.IsName("RunForward");

        // normalizedTime — 0.0 = start of animation, 1.0 = end
        float progress = info.normalizedTime;
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 9 — AudioSource API
    // ══════════════════════════════════════════════════════════════
    {
        id: 9,
        category: "AudioSource API",
        title: "AudioSource — Playing Sounds",
        description: "Play, PlayOneShot, volume, pitch, spatialBlend — כל מה שצריך לאודיו ב-Unity.",
        difficulty: 1,
        type: "api",
        code: `// AUDIOSOURCE — plays audio clips in the scene (2D or 3D spatial)
// Requires: Add Component > Audio > Audio Source
using UnityEngine;

public class AudioSourceAPI : MonoBehaviour
{
    AudioSource src;
    public AudioClip shootSound;
    public AudioClip musicClip;

    void Awake()
    {
        src = GetComponent<AudioSource>();
    }

    void Start()
    {
        // clip — assign which audio file this source plays by default
        src.clip = musicClip;

        // Play — start playing the assigned clip from the beginning
        src.Play();

        // Stop — immediately halt playback
        // src.Stop();

        // Pause / UnPause — freeze and resume at the same position
        // src.Pause();   src.UnPause();

        // volume — 0.0 (silent) to 1.0 (full volume)
        src.volume = 0.8f;

        // pitch — 1.0 = normal speed; 0.5 = half speed; 2.0 = double speed
        // changing pitch also changes perceived tone (like a tape deck)
        src.pitch = 1.2f;

        // loop — repeat automatically when the clip ends
        src.loop = true;

        // PlayOneShot — play a clip ONCE without interrupting the main clip
        // perfect for SFX: gunshots, footsteps, coins, explosions
        // volume parameter scales the clip's volume (1.0 = full)
        src.PlayOneShot(shootSound, 0.9f);

        // spatialBlend — 0.0 = fully 2D (no position), 1.0 = fully 3D
        // 3D audio gets quieter with distance (set AudioSource rolloff curve)
        src.spatialBlend = 1.0f;

        // isPlaying — check if the source is currently making sound
        bool playing = src.isPlaying;
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 10 — Camera API
    // ══════════════════════════════════════════════════════════════
    {
        id: 10,
        category: "Camera API",
        title: "Camera — Viewports, Rays, Projections",
        description: "Camera.main, ScreenToWorldPoint, ScreenPointToRay, fieldOfView.",
        difficulty: 2,
        type: "api",
        code: `// CAMERA — controls what the player sees; converts between screen and world
using UnityEngine;

public class CameraAPI : MonoBehaviour
{
    void Update()
    {
        // Camera.main — finds the camera tagged "MainCamera" in the scene
        // Cache this in Awake() if you call it often (FindWithTag is slow)
        Camera cam = Camera.main;

        // ScreenPointToRay — fire a ray from the camera through a screen pixel
        // Input.mousePosition is in pixels: (0,0)=bottom-left corner
        Ray ray = cam.ScreenPointToRay(Input.mousePosition);

        // WorldToScreenPoint — convert world position to pixel on screen
        // useful for placing UI elements above world objects
        Vector3 screenPos = cam.WorldToScreenPoint(transform.position);

        // ScreenToWorldPoint — convert pixel to world position
        // Z component = distance from camera (must be set manually)
        Vector3 worldPos = cam.ScreenToWorldPoint(
            new Vector3(Screen.width / 2f, Screen.height / 2f, 10f));

        // fieldOfView — camera FOV in degrees (60 default, 90 = wider angle)
        cam.fieldOfView = 75f;

        // orthographic — true = isometric/2D (no perspective), false = 3D
        cam.orthographic = false;

        // orthographicSize — half the height in world units (only in ortho mode)
        cam.orthographicSize = 5f;

        // nearClipPlane / farClipPlane — objects outside this range are invisible
        float near = cam.nearClipPlane; // default 0.3
        float far  = cam.farClipPlane;  // default 1000

        // viewport rect — what part of the screen this camera renders to
        // (0,0,1,1) = full screen; (0.5,0,0.5,0.5) = bottom-right quarter
        cam.rect = new Rect(0f, 0f, 1f, 1f);
    }
}`
    },

    // ══════════════════════════════════════════════════════════════
    // PRACTICAL EXAMPLES
    // ══════════════════════════════════════════════════════════════

    {
        id: 11,
        category: "דוגמה מעשית",
        title: "Ball Launcher — Rigidbody Forces",
        description: "HOW TO TEST: Create > 3D Object > Sphere → Add Rigidbody → Add this script. Space=launch, R=reset.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// BALL LAUNCHER — test Rigidbody forces in the scene
// HOW TO SET UP:
//   1. Create > 3D Object > Sphere
//   2. Add Component > Physics > Rigidbody
//   3. Add Component > this script (BallLauncher)
//   Press SPACE to launch, press R to reset position
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class BallLauncher : MonoBehaviour
{
    // [SerializeField] keeps field private but visible in the Inspector
    [SerializeField] private float launchForce = 15f;
    [SerializeField] private float upwardBias = 0.4f;  // arc angle

    private Rigidbody rb;
    private Vector3 startPos; // saved at Awake so we can reset

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        startPos = transform.position; // remember where we began
    }

    void Update()
    {
        // GetKeyDown — fires ONCE on the exact frame the key is pressed
        if (Input.GetKeyDown(KeyCode.Space)) Launch();
        if (Input.GetKeyDown(KeyCode.R))     ResetBall();
    }

    void Launch()
    {
        // Zero out any old movement so each launch feels identical
        rb.velocity = Vector3.zero;
        rb.angularVelocity = Vector3.zero;

        // transform.forward = direction this object's nose points
        // adding Vector3.up * bias makes the ball arc into the air
        Vector3 dir = transform.forward + Vector3.up * upwardBias;

        // ForceMode.Impulse = instant push proportional to mass
        // dir.normalized = same direction but magnitude exactly 1
        rb.AddForce(dir.normalized * launchForce, ForceMode.Impulse);
    }

    void ResetBall()
    {
        transform.position = startPos;   // teleport to start
        rb.velocity = Vector3.zero;      // stop all linear movement
        rb.angularVelocity = Vector3.zero; // stop all spinning
    }
}`
    },

    {
        id: 12,
        category: "דוגמה מעשית",
        title: "Top-Down Controller — Input + Transform",
        description: "HOW TO TEST: Create empty GameObject → Add this script. WASD to move, mouse to rotate.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// TOP-DOWN CONTROLLER — keyboard movement + mouse aiming
// HOW TO SET UP:
//   1. Create > 3D Object > Capsule
//   2. Add Component > this script (TopDownController)
//   3. Set Main Camera to look straight down (rotation 90,0,0)
//   WASD = move    |    mouse = face direction
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class TopDownController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;

    // CharacterController handles collision without a Rigidbody
    private CharacterController cc;

    void Awake()
    {
        cc = GetComponent<CharacterController>();
    }

    void Update()
    {
        Move();
        AimAtMouse();
    }

    void Move()
    {
        // GetAxisRaw snaps to -1, 0, +1 instantly (no smoothing)
        float h = Input.GetAxisRaw("Horizontal"); // A/D keys
        float v = Input.GetAxisRaw("Vertical");   // W/S keys

        // Build movement vector in XZ plane (Y=0 keeps it on the ground)
        Vector3 move = new Vector3(h, 0f, v);

        // Normalize prevents diagonal movement being 40% faster
        if (move.magnitude > 1f) move.Normalize();

        // SimpleMove applies gravity automatically and moves in world space
        cc.SimpleMove(move * moveSpeed);
    }

    void AimAtMouse()
    {
        // Cast a ray from camera through the mouse cursor into the world
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        Plane ground = new Plane(Vector3.up, Vector3.zero);

        // Plane.Raycast fills 'dist' with distance along the ray to the plane
        if (ground.Raycast(ray, out float dist))
        {
            // GetPoint — find the actual world position at that distance
            Vector3 mouseWorld = ray.GetPoint(dist);

            // LookAt — rotate to face the mouse position (ignore Y difference)
            mouseWorld.y = transform.position.y;
            transform.LookAt(mouseWorld);
        }
    }
}`
    },

    {
        id: 13,
        category: "דוגמה מעשית",
        title: "Click to Select — Mouse Raycast",
        description: "HOW TO TEST: Add cubes to scene → Add this to Camera. Left click selects, highlights, logs name.",
        difficulty: 3,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// CLICK TO SELECT — raycast from mouse to pick objects
// HOW TO SET UP:
//   1. Add several Cubes/Spheres to the scene
//   2. Attach this script to the Main Camera
//   Left-click any object to select it (turns yellow)
//   Click empty space to deselect
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class ClickToSelect : MonoBehaviour
{
    [SerializeField] private Color highlightColor = Color.yellow;
    [SerializeField] private LayerMask selectableLayers;

    private GameObject selectedObject;
    private Color originalColor;

    void Update()
    {
        // GetMouseButtonDown(0) = left mouse button, fires once per click
        if (Input.GetMouseButtonDown(0))
        {
            TrySelect();
        }
    }

    void TrySelect()
    {
        // Build a ray from the camera through the mouse pixel on screen
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        // Physics.Raycast returns true if the ray collides with anything
        if (Physics.Raycast(ray, out hit, Mathf.Infinity, selectableLayers))
        {
            // Deselect whatever was selected before
            Deselect();

            // Store reference and original color, then highlight
            selectedObject = hit.gameObject;
            Renderer rend = selectedObject.GetComponent<Renderer>();
            originalColor = rend.material.color;  // save the old color
            rend.material.color = highlightColor; // apply yellow highlight

            Debug.Log("Selected: " + selectedObject.name +
                      " at " + hit.point);
        }
        else
        {
            // Clicked empty space — deselect
            Deselect();
        }
    }

    void Deselect()
    {
        if (selectedObject == null) return;

        // Restore original color before clearing the reference
        selectedObject.GetComponent<Renderer>().material.color = originalColor;
        selectedObject = null;
    }
}`
    },

    {
        id: 14,
        category: "דוגמה מעשית",
        title: "Trigger Score Zone — Collider Events",
        description: "HOW TO TEST: Cube=IsTrigger checked → Add this script. Walk in with Player-tagged object → score up.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// TRIGGER SCORE ZONE — add points when player enters area
// HOW TO SET UP:
//   1. Create > 3D Object > Cube → scale it to a large flat area
//   2. On the Cube's Box Collider, check "Is Trigger"
//   3. Attach this script to the Cube
//   4. Tag your player GameObject as "Player"
//   Walk the Player into the zone — watch the Console
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class ScoreZone : MonoBehaviour
{
    [SerializeField] private int pointsToAward = 100;
    [SerializeField] private Color zoneColor = Color.green;

    private Renderer zoneRenderer;
    private int visitCount = 0;  // how many times player entered

    void Awake()
    {
        zoneRenderer = GetComponent<Renderer>();
        zoneRenderer.material.color = zoneColor;
    }

    // OnTriggerEnter fires once when a Collider enters the trigger volume
    // 'other' is the Collider that entered (could be player, enemy, ball...)
    void OnTriggerEnter(Collider other)
    {
        // CompareTag — faster than (other.tag == "Player"), uses hashed ID
        if (!other.CompareTag("Player")) return;

        visitCount++;
        Debug.Log("Player entered! Visit #" + visitCount +
                  " | +" + pointsToAward + " points");

        // Flash the zone bright to give visual feedback
        zoneRenderer.material.color = Color.white;
    }

    // OnTriggerStay fires EVERY frame while inside the trigger
    // use sparingly — it runs constantly and can be expensive
    void OnTriggerStay(Collider other) { }

    // OnTriggerExit fires once when the Collider leaves the volume
    void OnTriggerExit(Collider other)
    {
        if (!other.CompareTag("Player")) return;
        Debug.Log("Player left the zone.");

        // Restore zone color when player leaves
        zoneRenderer.material.color = zoneColor;
    }
}`
    },

    {
        id: 15,
        category: "דוגמה מעשית",
        title: "Fade Sequence — Coroutines in Practice",
        description: "HOW TO TEST: Canvas > Image → Add CanvasGroup → Add this script. Runs fade-in/pause/fade-out on Start.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// FADE SEQUENCE — timed fade using coroutines
// HOW TO SET UP:
//   1. Create > UI > Canvas > Image (set color to black, fill screen)
//   2. Add Component > CanvasGroup to the Image
//   3. Attach this script to the Image
//   On Play: fades in → waits → fades out automatically
// ═══════════════════════════════════════════════════════
using System.Collections;
using UnityEngine;

public class FadeSequence : MonoBehaviour
{
    [SerializeField] private float fadeInDuration  = 1.5f;
    [SerializeField] private float holdDuration    = 2.0f;
    [SerializeField] private float fadeOutDuration = 1.5f;

    private CanvasGroup cg; // controls alpha of all UI children at once

    void Start()
    {
        cg = GetComponent<CanvasGroup>();

        // Start the sequence — we can wait for it to finish with yield
        StartCoroutine(PlaySequence());
    }

    IEnumerator PlaySequence()
    {
        yield return StartCoroutine(Fade(0f, 1f, fadeInDuration));
        yield return new WaitForSeconds(holdDuration);
        yield return StartCoroutine(Fade(1f, 0f, fadeOutDuration));
        Debug.Log("Fade sequence complete!");
    }

    // Generic fade — goes from 'startAlpha' to 'endAlpha' over 'duration' seconds
    IEnumerator Fade(float startAlpha, float endAlpha, float duration)
    {
        float elapsed = 0f;
        cg.alpha = startAlpha;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime; // Time.deltaTime = seconds since last frame

            // Lerp = linear interpolation: blends from start to end by a 0-1 ratio
            cg.alpha = Mathf.Lerp(startAlpha, endAlpha, elapsed / duration);

            // yield return null = pause here, resume on the NEXT frame
            yield return null;
        }

        cg.alpha = endAlpha; // snap to exact final value (avoid floating point drift)
    }
}`
    },

    {
        id: 16,
        category: "דוגמה מעשית",
        title: "Player Animator — Code Drives State Machine",
        description: "HOW TO TEST: Capsule + Animator Controller with Speed(Float), IsGrounded(Bool), Jump(Trigger).",
        difficulty: 3,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// PLAYER ANIMATOR — drives Animator Controller from movement
// HOW TO SET UP:
//   1. Capsule with Rigidbody + CharacterController + Animator
//   2. Create Animator Controller with parameters:
//      Speed (Float), IsGrounded (Bool), Jump (Trigger)
//   3. Attach this script
//   WASD = move and watch animation blend  |  Space = jump trigger
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class PlayerAnimator : MonoBehaviour
{
    private Animator anim;
    private CharacterController cc;

    // Cache the parameter hashes — faster than passing strings every frame
    private static readonly int SpeedHash      = Animator.StringToHash("Speed");
    private static readonly int IsGroundedHash = Animator.StringToHash("IsGrounded");
    private static readonly int JumpHash       = Animator.StringToHash("Jump");

    [SerializeField] private float moveSpeed = 4f;
    [SerializeField] private float animSmoothTime = 0.1f; // blend smoothing

    void Awake()
    {
        anim = GetComponent<Animator>();
        cc   = GetComponent<CharacterController>();
    }

    void Update()
    {
        Vector2 input = new Vector2(
            Input.GetAxisRaw("Horizontal"),
            Input.GetAxisRaw("Vertical")
        );

        float targetSpeed = input.magnitude * moveSpeed;

        // Lerp the Speed param toward target — prevents animation snapping
        float currentSpeed = anim.GetFloat(SpeedHash);
        float newSpeed = Mathf.Lerp(currentSpeed, targetSpeed, animSmoothTime);
        anim.SetFloat(SpeedHash, newSpeed);

        // isGrounded — CharacterController updates this every Update
        anim.SetBool(IsGroundedHash, cc.isGrounded);

        // SetTrigger resets automatically after the transition fires once
        if (Input.GetKeyDown(KeyCode.Space) && cc.isGrounded)
        {
            anim.SetTrigger(JumpHash);
        }
    }
}`
    },

    {
        id: 17,
        category: "דוגמה מעשית",
        title: "Footstep System — AudioSource.PlayOneShot",
        description: "HOW TO TEST: Capsule moving + AudioSource + this script. Footstep sounds play from speed threshold.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// FOOTSTEP SYSTEM — play sounds based on movement speed
// HOW TO SET UP:
//   1. Player Capsule with CharacterController + AudioSource
//   2. Attach this script
//   3. Fill 'footstepSounds' array in Inspector with .wav files
//   Walk/run to hear footsteps at correct pace
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class FootstepSystem : MonoBehaviour
{
    [SerializeField] private AudioClip[] footstepSounds; // fill in Inspector
    [SerializeField] private float stepInterval = 0.45f;  // seconds between steps
    [SerializeField] private float minSpeedToPlay = 0.5f; // don't play when barely moving

    private AudioSource audioSrc;
    private CharacterController cc;
    private float stepTimer = 0f;
    private int lastIndex = -1; // avoid repeating the same clip twice in a row

    void Awake()
    {
        audioSrc = GetComponent<AudioSource>();
        cc = GetComponent<CharacterController>();

        // 2D sound — no position-based volume change
        audioSrc.spatialBlend = 0f;
    }

    void Update()
    {
        // cc.velocity.magnitude = current movement speed in units/second
        float speed = new Vector3(cc.velocity.x, 0f, cc.velocity.z).magnitude;
        bool isMoving = cc.isGrounded && speed > minSpeedToPlay;

        if (!isMoving) { stepTimer = 0f; return; }

        stepTimer += Time.deltaTime;

        // stepInterval decreases with speed — faster = more frequent steps
        float interval = stepInterval / (speed * 0.3f);
        if (stepTimer >= interval)
        {
            stepTimer = 0f;
            PlayRandomFootstep();
        }
    }

    void PlayRandomFootstep()
    {
        if (footstepSounds.Length == 0) return;

        // Pick a random clip but never the same one twice in a row
        int index;
        do { index = Random.Range(0, footstepSounds.Length); }
        while (index == lastIndex && footstepSounds.Length > 1);

        lastIndex = index;

        // PlayOneShot plays without interrupting any currently playing clip
        audioSrc.PlayOneShot(footstepSounds[index], 0.7f);
    }
}`
    },

    {
        id: 18,
        category: "דוגמה מעשית",
        title: "Camera Shake — Coroutine + Random",
        description: "HOW TO TEST: Add to Main Camera. Call CameraShake.Instance.Shake(0.5f, 0.3f) from anywhere.",
        difficulty: 3,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// CAMERA SHAKE — add trauma-based shake to Main Camera
// HOW TO SET UP:
//   1. Attach this script to the Main Camera
//   2. From any other script, call:
//      CameraShake.Instance.Shake(intensity, duration);
//   Example: on explosion — CameraShake.Instance.Shake(0.5f, 0.4f);
// ═══════════════════════════════════════════════════════
using System.Collections;
using UnityEngine;

public class CameraShake : MonoBehaviour
{
    // Singleton so any script can call Shake() without a reference
    public static CameraShake Instance { get; private set; }

    private Vector3 originalPosition; // saved so we can return to it

    void Awake()
    {
        Instance = this;
        originalPosition = transform.localPosition;
    }

    // Public API — call this to trigger a shake
    // intensity = max offset in Unity units (0.1 = subtle, 1.0 = violent)
    // duration  = how many seconds the shake lasts
    public void Shake(float intensity, float duration)
    {
        // If already shaking, stop it before starting a new one
        StopAllCoroutines();
        StartCoroutine(DoShake(intensity, duration));
    }

    IEnumerator DoShake(float intensity, float duration)
    {
        float elapsed = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;

            // t goes from 1.0 down to 0.0 — shake fades out over time
            float t = 1f - (elapsed / duration);

            // Random.insideUnitSphere = a random point within a sphere of radius 1
            // multiplying by intensity*t makes it smaller as time passes
            Vector3 offset = Random.insideUnitSphere * intensity * t;
            offset.z = 0f; // don't shake on Z for a 2D-style feel

            transform.localPosition = originalPosition + offset;

            yield return null; // wait one frame, then shake again
        }

        // Snap back to original position when done
        transform.localPosition = originalPosition;
    }
}`
    },

    {
        id: 19,
        category: "דוגמה מעשית",
        title: "Orbit Object — Transform Math",
        description: "HOW TO TEST: Two GameObjects — Parent stays still, Child gets this script. Radius and speed control orbit.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// ORBIT OBJECT — rotate around a center point using math
// HOW TO SET UP:
//   1. Create an empty GameObject as the center (call it "Center")
//   2. Create a Sphere as the orbiting body
//   3. Attach this script to the Sphere
//   4. Drag "Center" into the 'orbitTarget' field in Inspector
//   Adjust radius and speed in the Inspector while in Play mode
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class OrbitObject : MonoBehaviour
{
    [SerializeField] private Transform orbitTarget;   // the center to orbit
    [SerializeField] private float radius     = 5f;   // distance from center
    [SerializeField] private float orbitSpeed = 45f;  // degrees per second
    [SerializeField] private float heightOffset = 0f; // Y offset from center

    private float currentAngle = 0f; // tracks rotation in degrees

    void Update()
    {
        // Increase angle each frame by speed * deltaTime
        // Time.deltaTime = seconds elapsed since last frame (ensures framerate independence)
        currentAngle += orbitSpeed * Time.deltaTime;

        // Keep angle in 0-360 range (prevents float overflow after long play sessions)
        if (currentAngle >= 360f) currentAngle -= 360f;

        // Convert angle to radians (Mathf.Sin/Cos expect radians, not degrees)
        float rad = currentAngle * Mathf.Deg2Rad;

        // Calculate position on a circle: x = cos(angle)*r, z = sin(angle)*r
        Vector3 offset = new Vector3(
            Mathf.Cos(rad) * radius,  // X = how far right/left
            heightOffset,             // Y = vertical offset (flat orbit if 0)
            Mathf.Sin(rad) * radius   // Z = how far forward/back
        );

        // Add offset to the center point — this is the orbit position
        transform.position = orbitTarget.position + offset;

        // Always face the center (optional: comment out to let it spin freely)
        transform.LookAt(orbitTarget.position);
    }
}`
    },

    {
        id: 20,
        category: "דוגמה מעשית",
        title: "Save & Load — PlayerPrefs System",
        description: "HOW TO TEST: Add to any GameObject. Press S to save, L to load — check Console for values.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// SAVE & LOAD — persist data between play sessions with PlayerPrefs
// PlayerPrefs stores key-value pairs on disk (like a registry/plist)
// HOW TO TEST:
//   1. Attach this script to any empty GameObject
//   2. Press S in Play mode to save current score/level
//   3. Press L to load saved data — check Console output
//   4. Stop Play, press Play again, press L — data persists!
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class SaveLoadSystem : MonoBehaviour
{
    // String constants for keys — avoids typo bugs ("HighScore" vs "Highscore")
    private const string KEY_SCORE  = "HighScore";
    private const string KEY_LEVEL  = "Level";
    private const string KEY_VOLUME = "MusicVolume";

    private int score  = 250;  // example data to save
    private int level  = 3;
    private float volume = 0.8f;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.S)) SaveData();
        if (Input.GetKeyDown(KeyCode.L)) LoadData();
        if (Input.GetKeyDown(KeyCode.D)) DeleteAll();
    }

    void SaveData()
    {
        // SetInt / SetFloat / SetString — store value under a key
        PlayerPrefs.SetInt(KEY_SCORE, score);
        PlayerPrefs.SetInt(KEY_LEVEL, level);
        PlayerPrefs.SetFloat(KEY_VOLUME, volume);

        // Save — flush to disk immediately (otherwise it saves on app quit)
        PlayerPrefs.Save();
        Debug.Log("Saved: score=" + score + " level=" + level);
    }

    void LoadData()
    {
        // GetInt(key, defaultValue) — returns defaultValue if key doesn't exist yet
        score  = PlayerPrefs.GetInt(KEY_SCORE, 0);
        level  = PlayerPrefs.GetInt(KEY_LEVEL, 1);
        volume = PlayerPrefs.GetFloat(KEY_VOLUME, 1.0f);

        Debug.Log("Loaded: score=" + score + " level=" + level +
                  " volume=" + volume);
    }

    void DeleteAll()
    {
        // HasKey — check before deleting to confirm the key existed
        if (PlayerPrefs.HasKey(KEY_SCORE))
        {
            PlayerPrefs.DeleteKey(KEY_SCORE); // remove one specific key
        }

        PlayerPrefs.DeleteAll(); // nuclear option — wipe everything
        Debug.Log("All saved data deleted.");
    }
}`
    }
];
