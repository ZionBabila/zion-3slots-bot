// lessons/api/lessons-api.js
// Unity API reference lessons — learn every property and method as you type.

const LESSONS_API = [

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
        Vector3 side  = transform.right;

        // localScale — size multiplier (1 = normal, 2 = double size)
        transform.localScale = new Vector3(2f, 1f, 2f);

        // parent — which Transform owns this one in the hierarchy
        transform.SetParent(null); // null = make it a root object
    }
}`
    },

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
    void OnCollisionEnter(Collision collision)
    {
        Debug.Log("Touched: " + collision.gameObject.name);

        // CompareTag — faster than .tag == "Player" (uses hash internally)
        if (collision.gameObject.CompareTag("Player"))
        {
            // relativeVelocity — impact speed (magnitude = how hard the hit)
            float impactSpeed = collision.relativeVelocity.magnitude;
            Debug.Log("Impact speed: " + impactSpeed);
        }
    }

    // OnCollisionStay — fires EVERY frame while touching (expensive)
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

    {
        id: 7,
        category: "Coroutine API",
        title: "Coroutines — IEnumerator & yield",
        description: "קורוטינות — הדרך של Unity לעשות 'wait' בתוך קוד רגיל.",
        difficulty: 2,
        type: "api",
        code: `// COROUTINES — pause execution and resume later without blocking the game
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

        // StopCoroutine — stop a specific coroutine by reference
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

        // yield return new WaitForFixedUpdate — resume after FixedUpdate
        yield return new WaitForFixedUpdate();

        // yield return new WaitUntil — pause until condition is true
        yield return new WaitUntil(() => Input.GetKeyDown(KeyCode.Space));

        Debug.Log("Player pressed Space!");
    }

    IEnumerator CountDown(int from)
    {
        for (int i = from; i > 0; i--)
        {
            Debug.Log("T-minus: " + i);
            yield return new WaitForSeconds(1f);
        }
        Debug.Log("Launch!");
    }
}`
    },

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
        float speed = GetComponent<Rigidbody>().velocity.magnitude;
        anim.SetFloat("Speed", speed);

        // Lerp the value for smoother transitions (avoids snapping)
        float current = anim.GetFloat("Speed");
        anim.SetFloat("Speed", Mathf.Lerp(current, speed, 0.1f));

        // SetBool — drive a Bool parameter (toggle states)
        bool grounded = Physics.Raycast(transform.position, Vector3.down, 0.1f);
        anim.SetBool("IsGrounded", grounded);

        // SetTrigger — fire a one-shot event (resets itself after use)
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

        // volume — 0.0 (silent) to 1.0 (full volume)
        src.volume = 0.8f;

        // pitch — 1.0 = normal speed; 0.5 = half speed; 2.0 = double
        // changing pitch also changes perceived tone (like a tape deck)
        src.pitch = 1.2f;

        // loop — repeat automatically when the clip ends
        src.loop = true;

        // PlayOneShot — play a clip ONCE without interrupting the main clip
        // perfect for SFX: gunshots, footsteps, coins, explosions
        src.PlayOneShot(shootSound, 0.9f);

        // spatialBlend — 0.0 = fully 2D, 1.0 = fully 3D positional audio
        src.spatialBlend = 1.0f;

        // isPlaying — check if the source is currently making sound
        bool playing = src.isPlaying;
    }
}`
    },

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
        Ray ray = cam.ScreenPointToRay(Input.mousePosition);

        // WorldToScreenPoint — convert world position to pixel on screen
        Vector3 screenPos = cam.WorldToScreenPoint(transform.position);

        // ScreenToWorldPoint — convert pixel to world position
        // Z component = distance from camera (must be set manually)
        Vector3 worldPos = cam.ScreenToWorldPoint(
            new Vector3(Screen.width / 2f, Screen.height / 2f, 10f));

        // fieldOfView — camera FOV in degrees (60 default, 90 = wider)
        cam.fieldOfView = 75f;

        // orthographic — true = isometric/2D (no perspective), false = 3D
        cam.orthographic = false;

        // orthographicSize — half the height in world units (ortho only)
        cam.orthographicSize = 5f;

        // nearClipPlane / farClipPlane — outside this range = invisible
        float near = cam.nearClipPlane; // default 0.3
        float far  = cam.farClipPlane;  // default 1000

        // viewport rect — what part of the screen this camera renders to
        cam.rect = new Rect(0f, 0f, 1f, 1f);
    }
}`
    },
];
