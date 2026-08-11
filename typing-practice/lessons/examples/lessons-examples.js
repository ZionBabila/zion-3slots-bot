// lessons/examples/lessons-examples.js
// Practical Unity examples — complete scripts you can paste directly into Unity.

const LESSONS_EXAMPLES = [

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
    [SerializeField] private float launchForce = 15f;
    [SerializeField] private float upwardBias  = 0.4f; // arc angle

    private Rigidbody rb;
    private Vector3 startPos;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        startPos = transform.position;
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space)) Launch();
        if (Input.GetKeyDown(KeyCode.R))     ResetBall();
    }

    void Launch()
    {
        rb.velocity        = Vector3.zero;
        rb.angularVelocity = Vector3.zero;

        // transform.forward + upward bias creates an arcing trajectory
        Vector3 dir = transform.forward + Vector3.up * upwardBias;

        // ForceMode.Impulse = instant push proportional to mass
        rb.AddForce(dir.normalized * launchForce, ForceMode.Impulse);
    }

    void ResetBall()
    {
        transform.position = startPos;
        rb.velocity        = Vector3.zero;
        rb.angularVelocity = Vector3.zero;
    }
}`
    },

    {
        id: 12,
        category: "דוגמה מעשית",
        title: "Top-Down Controller — Input + Transform",
        description: "HOW TO TEST: Capsule + CharacterController → Add this script. WASD to move, mouse to aim.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// TOP-DOWN CONTROLLER — keyboard movement + mouse aiming
// HOW TO SET UP:
//   1. Create > 3D Object > Capsule
//   2. Add Component > Physics > Character Controller
//   3. Add Component > this script (TopDownController)
//   4. Set Main Camera rotation to (90, 0, 0) for top-down view
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class TopDownController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;

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
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");

        Vector3 move = new Vector3(h, 0f, v);

        // Normalize prevents diagonal movement being 40% faster
        if (move.magnitude > 1f) move.Normalize();

        // SimpleMove applies gravity automatically
        cc.SimpleMove(move * moveSpeed);
    }

    void AimAtMouse()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        Plane ground = new Plane(Vector3.up, Vector3.zero);

        if (ground.Raycast(ray, out float dist))
        {
            Vector3 mouseWorld = ray.GetPoint(dist);
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
        description: "HOW TO TEST: Add cubes to scene → Attach to Camera. Left click selects (turns yellow).",
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
        if (Input.GetMouseButtonDown(0)) TrySelect();
    }

    void TrySelect()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit, Mathf.Infinity, selectableLayers))
        {
            Deselect();
            selectedObject = hit.gameObject;
            Renderer rend = selectedObject.GetComponent<Renderer>();
            originalColor = rend.material.color;
            rend.material.color = highlightColor;
            Debug.Log("Selected: " + selectedObject.name + " at " + hit.point);
        }
        else
        {
            Deselect();
        }
    }

    void Deselect()
    {
        if (selectedObject == null) return;
        selectedObject.GetComponent<Renderer>().material.color = originalColor;
        selectedObject = null;
    }
}`
    },

    {
        id: 14,
        category: "דוגמה מעשית",
        title: "Trigger Score Zone — Collider Events",
        description: "HOW TO TEST: Cube with Is Trigger checked → Add this script → Tag player בתור Player.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// TRIGGER SCORE ZONE — add points when player enters area
// HOW TO SET UP:
//   1. Create > 3D Object > Cube → scale it to a large flat area
//   2. On the Cube's Box Collider, check "Is Trigger"
//   3. Attach this script to the Cube
//   4. Tag your player GameObject as "Player"
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class ScoreZone : MonoBehaviour
{
    [SerializeField] private int   pointsToAward = 100;
    [SerializeField] private Color zoneColor     = Color.green;

    private Renderer zoneRenderer;
    private int visitCount = 0;

    void Awake()
    {
        zoneRenderer = GetComponent<Renderer>();
        zoneRenderer.material.color = zoneColor;
    }

    void OnTriggerEnter(Collider other)
    {
        // CompareTag — faster than (other.tag == "Player")
        if (!other.CompareTag("Player")) return;

        visitCount++;
        Debug.Log("Player entered! Visit #" + visitCount +
                  " | +" + pointsToAward + " points");

        zoneRenderer.material.color = Color.white; // flash on entry
    }

    void OnTriggerStay(Collider other)  { } // runs every frame inside

    void OnTriggerExit(Collider other)
    {
        if (!other.CompareTag("Player")) return;
        Debug.Log("Player left the zone.");
        zoneRenderer.material.color = zoneColor;
    }
}`
    },

    {
        id: 15,
        category: "דוגמה מעשית",
        title: "Fade Sequence — Coroutines in Practice",
        description: "HOW TO TEST: Canvas > Image → Add CanvasGroup → Add this script. Fades in/out on Start.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// FADE SEQUENCE — timed fade using coroutines
// HOW TO SET UP:
//   1. Create > UI > Canvas > Image (black, fill screen)
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

    private CanvasGroup cg;

    void Start()
    {
        cg = GetComponent<CanvasGroup>();
        StartCoroutine(PlaySequence());
    }

    IEnumerator PlaySequence()
    {
        yield return StartCoroutine(Fade(0f, 1f, fadeInDuration));
        yield return new WaitForSeconds(holdDuration);
        yield return StartCoroutine(Fade(1f, 0f, fadeOutDuration));
        Debug.Log("Fade sequence complete!");
    }

    // Generic fade from startAlpha to endAlpha over 'duration' seconds
    IEnumerator Fade(float startAlpha, float endAlpha, float duration)
    {
        float elapsed = 0f;
        cg.alpha = startAlpha;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            // Lerp = linear interpolation between two values by a 0-1 ratio
            cg.alpha = Mathf.Lerp(startAlpha, endAlpha, elapsed / duration);
            yield return null; // pause, resume next frame
        }

        cg.alpha = endAlpha; // snap to exact value (avoid float drift)
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
//   1. Capsule with CharacterController + Animator
//   2. Animator Controller with params:
//      Speed (Float), IsGrounded (Bool), Jump (Trigger)
//   3. Attach this script
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class PlayerAnimator : MonoBehaviour
{
    private Animator anim;
    private CharacterController cc;

    // Cache hashes — faster than passing strings every frame
    private static readonly int SpeedHash      = Animator.StringToHash("Speed");
    private static readonly int IsGroundedHash = Animator.StringToHash("IsGrounded");
    private static readonly int JumpHash       = Animator.StringToHash("Jump");

    [SerializeField] private float moveSpeed       = 4f;
    [SerializeField] private float animSmoothTime  = 0.1f;

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

        // Lerp Speed param toward target — prevents animation snapping
        float current  = anim.GetFloat(SpeedHash);
        float newSpeed = Mathf.Lerp(current, targetSpeed, animSmoothTime);
        anim.SetFloat(SpeedHash, newSpeed);

        anim.SetBool(IsGroundedHash, cc.isGrounded);

        if (Input.GetKeyDown(KeyCode.Space) && cc.isGrounded)
            anim.SetTrigger(JumpHash);
    }
}`
    },

    {
        id: 17,
        category: "דוגמה מעשית",
        title: "Footstep System — AudioSource.PlayOneShot",
        description: "HOW TO TEST: Capsule + CharacterController + AudioSource + this script + footstep clips.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// FOOTSTEP SYSTEM — play sounds based on movement speed
// HOW TO SET UP:
//   1. Capsule with CharacterController + AudioSource
//   2. Attach this script
//   3. Fill 'footstepSounds' array in Inspector with .wav clips
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class FootstepSystem : MonoBehaviour
{
    [SerializeField] private AudioClip[] footstepSounds;
    [SerializeField] private float stepInterval  = 0.45f;
    [SerializeField] private float minSpeed      = 0.5f;

    private AudioSource audioSrc;
    private CharacterController cc;
    private float stepTimer = 0f;
    private int   lastIndex = -1;

    void Awake()
    {
        audioSrc = GetComponent<AudioSource>();
        cc       = GetComponent<CharacterController>();
        audioSrc.spatialBlend = 0f; // 2D sound
    }

    void Update()
    {
        float speed = new Vector3(cc.velocity.x, 0f, cc.velocity.z).magnitude;
        bool isMoving = cc.isGrounded && speed > minSpeed;

        if (!isMoving) { stepTimer = 0f; return; }

        stepTimer += Time.deltaTime;

        // Faster movement = shorter interval between steps
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

        // Never play the same clip twice in a row
        int index;
        do { index = Random.Range(0, footstepSounds.Length); }
        while (index == lastIndex && footstepSounds.Length > 1);

        lastIndex = index;
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
// ═══════════════════════════════════════════════════════
using System.Collections;
using UnityEngine;

public class CameraShake : MonoBehaviour
{
    // Singleton so any script can call Shake() without a reference
    public static CameraShake Instance { get; private set; }

    private Vector3 originalPosition;

    void Awake()
    {
        Instance         = this;
        originalPosition = transform.localPosition;
    }

    public void Shake(float intensity, float duration)
    {
        StopAllCoroutines();
        StartCoroutine(DoShake(intensity, duration));
    }

    IEnumerator DoShake(float intensity, float duration)
    {
        float elapsed = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;

            // t fades from 1.0 to 0.0 — shake weakens over time
            float t = 1f - (elapsed / duration);

            // insideUnitSphere = random point within a radius-1 sphere
            Vector3 offset = Random.insideUnitSphere * intensity * t;
            offset.z = 0f; // no Z shake for a 2D-style feel

            transform.localPosition = originalPosition + offset;
            yield return null;
        }

        transform.localPosition = originalPosition;
    }
}`
    },

    {
        id: 19,
        category: "דוגמה מעשי\u05ET",
        title: "Orbit Object — Transform Math",
        description: "HOW TO TEST: Empty center + Sphere → Add this to Sphere → Drag center into orbitTarget.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// ORBIT OBJECT — rotate around a center point using math
// HOW TO SET UP:
//   1. Create an empty GameObject as center (call it "Center")
//   2. Create a Sphere as the orbiting body
//   3. Attach this script to the Sphere
//   4. Drag "Center" into the orbitTarget field
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class OrbitObject : MonoBehaviour
{
    [SerializeField] private Transform orbitTarget;
    [SerializeField] private float radius       = 5f;
    [SerializeField] private float orbitSpeed   = 45f; // degrees/second
    [SerializeField] private float heightOffset = 0f;

    private float currentAngle = 0f;

    void Update()
    {
        currentAngle += orbitSpeed * Time.deltaTime;
        if (currentAngle >= 360f) currentAngle -= 360f;

        // Convert degrees to radians (Sin/Cos expect radians)
        float rad = currentAngle * Mathf.Deg2Rad;

        // Circle formula: x = cos(a)*r, z = sin(a)*r
        Vector3 offset = new Vector3(
            Mathf.Cos(rad) * radius,
            heightOffset,
            Mathf.Sin(rad) * radius
        );

        transform.position = orbitTarget.position + offset;
        transform.LookAt(orbitTarget.position);
    }
}`
    },

    {
        id: 20,
        category: "דוגמה מעשית",
        title: "Save & Load — PlayerPrefs System",
        description: "HOW TO TEST: Add to any GameObject. S=save, L=load, D=delete all — check Console.",
        difficulty: 2,
        type: "example",
        code: `// ═══════════════════════════════════════════════════════
// SAVE & LOAD — persist data with PlayerPrefs
// PlayerPrefs stores key-value pairs on disk (like a registry/plist)
// HOW TO TEST:
//   1. Attach this script to any empty GameObject
//   2. Press S to save, L to load, D to delete all
//   3. Stop Play, press Play again, press L — data persists!
// ═══════════════════════════════════════════════════════
using UnityEngine;

public class SaveLoadSystem : MonoBehaviour
{
    // String constants avoid typo bugs ("HighScore" vs "Highscore")
    private const string KEY_SCORE  = "HighScore";
    private const string KEY_LEVEL  = "Level";
    private const string KEY_VOLUME = "MusicVolume";

    private int   score  = 250;
    private int   level  = 3;
    private float volume = 0.8f;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.S)) SaveData();
        if (Input.GetKeyDown(KeyCode.L)) LoadData();
        if (Input.GetKeyDown(KeyCode.D)) DeleteAll();
    }

    void SaveData()
    {
        PlayerPrefs.SetInt(KEY_SCORE,   score);
        PlayerPrefs.SetInt(KEY_LEVEL,   level);
        PlayerPrefs.SetFloat(KEY_VOLUME, volume);
        PlayerPrefs.Save(); // flush to disk immediately
        Debug.Log("Saved: score=" + score + " level=" + level);
    }

    void LoadData()
    {
        // GetInt(key, default) — returns default if key doesn't exist yet
        score  = PlayerPrefs.GetInt(KEY_SCORE, 0);
        level  = PlayerPrefs.GetInt(KEY_LEVEL, 1);
        volume = PlayerPrefs.GetFloat(KEY_VOLUME, 1.0f);
        Debug.Log("Loaded: score=" + score + " level=" + level);
    }

    void DeleteAll()
    {
        if (PlayerPrefs.HasKey(KEY_SCORE))
            PlayerPrefs.DeleteKey(KEY_SCORE);

        PlayerPrefs.DeleteAll();
        Debug.Log("All saved data deleted.");
    }
}`
    },
];
