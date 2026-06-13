const LESSONS = [
    // ============================================================
    // Category 1: MonoBehaviour - יסודות
    // ============================================================
    {
        id: 1,
        category: "MonoBehaviour - יסודות",
        title: "Player Controller",
        description: "מבנה בסיסי עם Awake, Start, Update — תנועה עם Rigidbody.",
        difficulty: 1,
        code: `using UnityEngine;

public class PlayerController : MonoBehaviour
{
    private float speed = 5f;
    private Rigidbody rb;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Start()
    {
        Debug.Log("Player ready!");
    }

    void Update()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        Vector3 dir = new Vector3(h, 0f, v);
        rb.MovePosition(transform.position + dir * speed * Time.deltaTime);
    }
}`
    },
    {
        id: 2,
        category: "MonoBehaviour - יסודות",
        title: "OnEnable / OnDisable",
        description: "ניהול מנויים לאירועים — הרשמה ב-OnEnable, ביטול ב-OnDisable.",
        difficulty: 1,
        code: `using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    public GameObject enemyPrefab;
    private bool isActive = false;

    void OnEnable()
    {
        isActive = true;
        Debug.Log("Spawner enabled");
    }

    void OnDisable()
    {
        isActive = false;
        Debug.Log("Spawner disabled");
    }

    void OnDestroy()
    {
        Debug.Log("Spawner destroyed");
    }

    void Update()
    {
        if (!isActive) return;
        // spawning logic here
    }
}`
    },
    {
        id: 3,
        category: "MonoBehaviour - יסודות",
        title: "Collision Detection",
        description: "זיהוי התנגשויות עם OnCollisionEnter ו-OnTriggerEnter.",
        difficulty: 1,
        code: `using UnityEngine;

public class Coin : MonoBehaviour
{
    public int value = 10;

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            GameManager.Instance.AddScore(value);
            Destroy(gameObject);
        }
    }

    void OnCollisionEnter(Collision col)
    {
        if (col.gameObject.CompareTag("Ground"))
        {
            Debug.Log("Hit the ground!");
        }
    }
}`
    },

    // ============================================================
    // Category 2: תבניות - Design Patterns
    // ============================================================
    {
        id: 4,
        category: "תבניות - Design Patterns",
        title: "Singleton GameManager",
        description: "Singleton בטוח עם DontDestroyOnLoad — אחד מהתבניות הנפוצות ביותר ב-Unity.",
        difficulty: 2,
        code: `using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    private int score = 0;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void AddScore(int points)
    {
        score += points;
        Debug.Log("Score: " + score);
    }

    public int GetScore()
    {
        return score;
    }
}`
    },
    {
        id: 5,
        category: "תבניות - Design Patterns",
        title: "Observer — C# Events",
        description: "מנגנון אירועים עם Action — publisher מפרסם, subscribers מגיבים.",
        difficulty: 2,
        code: `using System;
using UnityEngine;

public class HealthSystem : MonoBehaviour
{
    public static event Action<int> OnHealthChanged;
    public static event Action OnPlayerDied;

    private int health = 100;

    public void TakeDamage(int amount)
    {
        health -= amount;
        OnHealthChanged?.Invoke(health);

        if (health <= 0)
        {
            health = 0;
            OnPlayerDied?.Invoke();
        }
    }

    public void Heal(int amount)
    {
        health = Mathf.Min(health + amount, 100);
        OnHealthChanged?.Invoke(health);
    }
}`
    },
    {
        id: 6,
        category: "תבניות - Design Patterns",
        title: "Observer — Subscriber",
        description: "הרשמה לאירועים ב-OnEnable וביטול ב-OnDisable למניעת memory leaks.",
        difficulty: 2,
        code: `using UnityEngine;
using UnityEngine.UI;

public class HealthUI : MonoBehaviour
{
    public Slider healthSlider;
    public Image fillImage;

    void OnEnable()
    {
        HealthSystem.OnHealthChanged += UpdateHealthBar;
        HealthSystem.OnPlayerDied += ShowDeathScreen;
    }

    void OnDisable()
    {
        HealthSystem.OnHealthChanged -= UpdateHealthBar;
        HealthSystem.OnPlayerDied -= ShowDeathScreen;
    }

    void UpdateHealthBar(int health)
    {
        healthSlider.value = health / 100f;
        fillImage.color = Color.Lerp(Color.red, Color.green, healthSlider.value);
    }

    void ShowDeathScreen()
    {
        gameObject.SetActive(false);
    }
}`
    },
    {
        id: 7,
        category: "תבניות - Design Patterns",
        title: "State Machine — Enemy AI",
        description: "מכונת מצבים פשוטה עם enum ו-switch — אויב שמזהה ורודף אחר השחקן.",
        difficulty: 3,
        code: `using UnityEngine;

public enum EnemyState { Idle, Chase, Attack, Dead }

public class EnemyAI : MonoBehaviour
{
    private EnemyState state = EnemyState.Idle;
    private Transform player;
    public float detectionRange = 10f;
    public float attackRange = 2f;

    void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player").transform;
    }

    void Update()
    {
        float dist = Vector3.Distance(transform.position, player.position);

        switch (state)
        {
            case EnemyState.Idle:
                if (dist < detectionRange) state = EnemyState.Chase;
                break;
            case EnemyState.Chase:
                transform.position = Vector3.MoveTowards(
                    transform.position, player.position, 3f * Time.deltaTime);
                if (dist < attackRange) state = EnemyState.Attack;
                break;
            case EnemyState.Attack:
                Debug.Log("Attacking!");
                if (dist > attackRange) state = EnemyState.Chase;
                break;
        }
    }
}`
    },

    // ============================================================
    // Category 3: קורוטינות - Coroutines
    // ============================================================
    {
        id: 8,
        category: "קורוטינות - Coroutines",
        title: "Fade In / Fade Out",
        description: "אפקט כניסה ויציאה — שימוש ב-IEnumerator ו-CanvasGroup.alpha.",
        difficulty: 2,
        code: `using System.Collections;
using UnityEngine;

public class UIFader : MonoBehaviour
{
    private CanvasGroup canvasGroup;

    void Start()
    {
        canvasGroup = GetComponent<CanvasGroup>();
        StartCoroutine(FadeIn(1.5f));
    }

    IEnumerator FadeIn(float duration)
    {
        float elapsed = 0f;
        canvasGroup.alpha = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            canvasGroup.alpha = elapsed / duration;
            yield return null;
        }

        canvasGroup.alpha = 1f;
    }

    IEnumerator FadeOut(float duration)
    {
        float elapsed = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            canvasGroup.alpha = 1f - (elapsed / duration);
            yield return null;
        }

        canvasGroup.alpha = 0f;
    }
}`
    },
    {
        id: 9,
        category: "קורוטינות - Coroutines",
        title: "Countdown Timer",
        description: "טיימר ספירה לאחור עם WaitForSeconds — עצירה ואיפוס.",
        difficulty: 2,
        code: `using System.Collections;
using UnityEngine;
using TMPro;

public class CountdownTimer : MonoBehaviour
{
    public float duration = 60f;
    public TMP_Text timerText;

    private float timeRemaining;
    private bool isRunning = false;

    public void StartTimer()
    {
        timeRemaining = duration;
        isRunning = true;
        StartCoroutine(Countdown());
    }

    public void StopTimer()
    {
        isRunning = false;
        StopAllCoroutines();
    }

    IEnumerator Countdown()
    {
        while (timeRemaining > 0f && isRunning)
        {
            timeRemaining -= Time.deltaTime;
            int seconds = Mathf.CeilToInt(timeRemaining);
            timerText.text = seconds.ToString();
            yield return null;
        }

        timerText.text = "0";
        isRunning = false;
        Debug.Log("Time's up!");
    }
}`
    },
    {
        id: 10,
        category: "קורוטינות - Coroutines",
        title: "Spawner Coroutine",
        description: "ספאוונר שמוצץ אובייקטים כל X שניות עם WaitForSeconds.",
        difficulty: 2,
        code: `using System.Collections;
using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    public GameObject enemyPrefab;
    public float spawnInterval = 3f;
    public int maxEnemies = 10;
    public Transform[] spawnPoints;

    private int currentCount = 0;

    void Start()
    {
        StartCoroutine(SpawnLoop());
    }

    IEnumerator SpawnLoop()
    {
        while (true)
        {
            yield return new WaitForSeconds(spawnInterval);

            if (currentCount < maxEnemies)
            {
                SpawnEnemy();
            }
        }
    }

    void SpawnEnemy()
    {
        int index = Random.Range(0, spawnPoints.Length);
        Transform spawnPoint = spawnPoints[index];
        Instantiate(enemyPrefab, spawnPoint.position, spawnPoint.rotation);
        currentCount++;
    }
}`
    },

    // ============================================================
    // Category 4: מערכות - Systems
    // ============================================================
    {
        id: 11,
        category: "מערכות - Systems",
        title: "Object Pool",
        description: "Object Pooling עם Queue — נמנע מ-Instantiate/Destroy יקרים.",
        difficulty: 3,
        code: `using System.Collections.Generic;
using UnityEngine;

public class BulletPool : MonoBehaviour
{
    public static BulletPool Instance { get; private set; }

    public GameObject bulletPrefab;
    public int poolSize = 20;

    private Queue<GameObject> pool = new Queue<GameObject>();

    void Awake()
    {
        Instance = this;
        for (int i = 0; i < poolSize; i++)
        {
            GameObject obj = Instantiate(bulletPrefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject GetBullet()
    {
        if (pool.Count > 0)
        {
            GameObject bullet = pool.Dequeue();
            bullet.SetActive(true);
            return bullet;
        }
        return Instantiate(bulletPrefab);
    }

    public void ReturnBullet(GameObject bullet)
    {
        bullet.SetActive(false);
        pool.Enqueue(bullet);
    }
}`
    },
    {
        id: 12,
        category: "מערכות - Systems",
        title: "Audio Manager",
        description: "מנהל אודיו עם Singleton — מוזיקה ואפקטי קול נפרדים.",
        difficulty: 2,
        code: `using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }

    public AudioSource musicSource;
    public AudioSource sfxSource;

    void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void PlaySFX(AudioClip clip)
    {
        sfxSource.PlayOneShot(clip);
    }

    public void PlayMusic(AudioClip clip, bool loop = true)
    {
        if (musicSource.clip == clip) return;
        musicSource.clip = clip;
        musicSource.loop = loop;
        musicSource.Play();
    }

    public void SetMusicVolume(float volume)
    {
        musicSource.volume = Mathf.Clamp01(volume);
    }

    public void SetSFXVolume(float volume)
    {
        sfxSource.volume = Mathf.Clamp01(volume);
    }
}`
    },
    {
        id: 13,
        category: "מערכות - Systems",
        title: "ScriptableObject — Item",
        description: "ScriptableObject להגדרת נתוני פריטים — נפרד מהסצנה.",
        difficulty: 2,
        code: `using UnityEngine;

[CreateAssetMenu(fileName = "NewItem", menuName = "Game/Item")]
public class ItemData : ScriptableObject
{
    public string itemName;
    public Sprite icon;
    public int damage;
    public float cooldown;
    public string description;

    public ItemType itemType;
    public Rarity rarity;

    public enum ItemType { Weapon, Armor, Consumable }
    public enum Rarity { Common, Rare, Epic, Legendary }
}

public class Inventory : MonoBehaviour
{
    public ItemData[] items;

    void Start()
    {
        foreach (ItemData item in items)
        {
            Debug.Log(item.itemName + " - Damage: " + item.damage);
        }
    }
}`
    },

    // ============================================================
    // Category 5: UI
    // ============================================================
    {
        id: 14,
        category: "UI - ממשק משתמש",
        title: "Health Bar",
        description: "Health Bar עם Slider ו-Gradient — צבע משתנה לפי אחוז החיים.",
        difficulty: 1,
        code: `using UnityEngine;
using UnityEngine.UI;

public class HealthBar : MonoBehaviour
{
    public Slider slider;
    public Gradient gradient;
    public Image fill;

    public void SetMaxHealth(int maxHealth)
    {
        slider.maxValue = maxHealth;
        slider.value = maxHealth;
        fill.color = gradient.Evaluate(1f);
    }

    public void SetHealth(int health)
    {
        slider.value = health;
        fill.color = gradient.Evaluate(slider.normalizedValue);
    }
}`
    },
    {
        id: 15,
        category: "UI - ממשק משתמש",
        title: "Scene Loader",
        description: "מעבר בין סצנות עם SceneManager — טעינה, ריענון וחזרה לתפריט.",
        difficulty: 1,
        code: `using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneLoader : MonoBehaviour
{
    public void LoadScene(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }

    public void LoadNextScene()
    {
        int next = SceneManager.GetActiveScene().buildIndex + 1;
        SceneManager.LoadScene(next);
    }

    public void ReloadScene()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    public void LoadMainMenu()
    {
        SceneManager.LoadScene("MainMenu");
    }

    public void QuitGame()
    {
        Application.Quit();
        Debug.Log("Game quit");
    }
}`
    },

    // ============================================================
    // Category 6: פיזיקה - Physics
    // ============================================================
    {
        id: 16,
        category: "פיזיקה - Physics",
        title: "Player Jump",
        description: "קפיצה עם Rigidbody.AddForce — בדיקת isGrounded עם OnCollisionEnter.",
        difficulty: 2,
        code: `using UnityEngine;

public class PlayerJump : MonoBehaviour
{
    public float jumpForce = 8f;
    private Rigidbody rb;
    private bool isGrounded = false;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            isGrounded = false;
        }
    }

    void OnCollisionEnter(Collision col)
    {
        if (col.gameObject.CompareTag("Ground"))
        {
            isGrounded = true;
        }
    }
}`
    },
    {
        id: 17,
        category: "פיזיקה - Physics",
        title: "Mouse Raycast Shooter",
        description: "ירי עם Raycast מהמצלמה אל עכבר — פגיעה ב-Layer מסוים.",
        difficulty: 3,
        code: `using UnityEngine;

public class MouseShooter : MonoBehaviour
{
    public float range = 100f;
    public int damage = 25;
    public LayerMask targetLayer;
    public ParticleSystem hitEffect;

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Shoot();
        }
    }

    void Shoot()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit, range, targetLayer))
        {
            Debug.Log("Hit: " + hit.transform.name);

            IDamageable target = hit.transform.GetComponent<IDamageable>();
            target?.TakeDamage(damage);

            if (hitEffect != null)
            {
                Instantiate(hitEffect, hit.point, Quaternion.LookRotation(hit.normal));
            }
        }
    }
}

public interface IDamageable
{
    void TakeDamage(int amount);
}`
    },
    {
        id: 18,
        category: "פיזיקה - Physics",
        title: "Camera Follow",
        description: "מצלמה חלקה שעוקבת אחרי שחקן עם Vector3.Lerp ו-LateUpdate.",
        difficulty: 1,
        code: `using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    public Transform target;
    public float smoothSpeed = 5f;
    public Vector3 offset = new Vector3(0f, 5f, -10f);

    void LateUpdate()
    {
        if (target == null) return;

        Vector3 desiredPosition = target.position + offset;
        transform.position = Vector3.Lerp(
            transform.position,
            desiredPosition,
            smoothSpeed * Time.deltaTime
        );

        transform.LookAt(target);
    }
}`
    },

    // ============================================================
    // Category 7: שמירה - Saving
    // ============================================================
    {
        id: 19,
        category: "שמירה - Saving",
        title: "PlayerPrefs Save System",
        description: "שמירה וטעינה של נתונים עם PlayerPrefs — ניקוד ורמה נוכחית.",
        difficulty: 2,
        code: `using UnityEngine;

public static class SaveSystem
{
    private const string SCORE_KEY = "HighScore";
    private const string LEVEL_KEY = "CurrentLevel";
    private const string VOLUME_KEY = "MusicVolume";

    public static void SaveProgress(int score, int level)
    {
        PlayerPrefs.SetInt(SCORE_KEY, score);
        PlayerPrefs.SetInt(LEVEL_KEY, level);
        PlayerPrefs.Save();
        Debug.Log("Progress saved!");
    }

    public static int LoadHighScore()
    {
        return PlayerPrefs.GetInt(SCORE_KEY, 0);
    }

    public static int LoadLevel()
    {
        return PlayerPrefs.GetInt(LEVEL_KEY, 1);
    }

    public static float LoadVolume()
    {
        return PlayerPrefs.GetFloat(VOLUME_KEY, 1f);
    }

    public static void DeleteAll()
    {
        PlayerPrefs.DeleteAll();
    }
}`
    },
    {
        id: 20,
        category: "שמירה - Saving",
        title: "JSON Save / Load",
        description: "שמירה לקובץ JSON עם JsonUtility — persistentDataPath ו-File API.",
        difficulty: 3,
        code: `using System.IO;
using UnityEngine;

[System.Serializable]
public class GameData
{
    public int score;
    public int level;
    public float[] playerPosition = new float[3];
}

public class JsonSaveSystem : MonoBehaviour
{
    private string savePath;

    void Awake()
    {
        savePath = Application.persistentDataPath + "/save.json";
    }

    public void Save(GameData data)
    {
        string json = JsonUtility.ToJson(data, true);
        File.WriteAllText(savePath, json);
        Debug.Log("Saved to: " + savePath);
    }

    public GameData Load()
    {
        if (!File.Exists(savePath))
        {
            Debug.Log("No save file found, starting fresh.");
            return new GameData();
        }
        string json = File.ReadAllText(savePath);
        return JsonUtility.FromJson<GameData>(json);
    }

    public void DeleteSave()
    {
        if (File.Exists(savePath))
        {
            File.Delete(savePath);
        }
    }
}`
    }
];
