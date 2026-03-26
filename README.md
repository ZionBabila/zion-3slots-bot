# 🎯 Zion 3-Slots Bot

Automated planning reminders via NTFY and Claude partnership for effective time management.

## Overview

This GitHub Actions automation delivers daily and weekly planning reminders to your phone and desktop using the NTFY push notification service. It's designed to support the **3-Slot Methodology** combined with **GTD (Getting Things Done)** and **על זה** (Yair Yona's self-management approach).

## Features

✅ **Daily Evening Review** (20:00 Israel time)
- Automated NTFY push notification
- - Planning prompts: What was accomplished? What are tomorrow's 3 slots?
  - - Runs every day via GitHub Actions
   
    - ✅ **Weekly Sunday Planning** (07:00 Israel time)
    - - Automated NTFY push notification
      - - Comprehensive 30-minute planning agenda
        - - GTD 5 pillars + על זה principles integration
          - - Runs every Sunday via GitHub Actions
           
            - ✅ **Cloud-Based 24/7 Automation**
            - - No need to keep your computer on
              - - GitHub Actions runs independently
                - - NTFY delivers notifications to your iPhone and desktop
                 
                  - ## How It Works
                 
                  - ### Architecture
                 
                  - 1. **GitHub Actions Workflows** (`.github/workflows/`)
                    2.    - `daily-evening-review.yml`: Triggers daily at 18:00 UTC (20:00 Israel time)
                          -    - `weekly-sunday-planning.yml`: Triggers every Sunday at 05:00 UTC (07:00 Israel time)
                           
                               - 2. **NTFY Integration**
                                 3.    - Topic: `https://ntfy.sh/zion-3slots`
                                       -    - Receives push notifications to any subscribed client (iPhone, desktop, web)
                                            -    - High priority notifications ensure visibility
                                             
                                                 - 3. **Notion Integration**
                                                   4.    - Your planning board: `🎯 3 סלוטים — זה הכל`
                                                         -    - Update after each notification
                                                              -    - Track 3 active slots: Money/פרנסה, Build/בנייה, Explore/חקירה
                                                               
                                                                   - ## Requirements
                                                               
                                                                   - 1. **NTFY Subscription**
                                                                     2.    - Subscribe to the topic: https://ntfy.sh/zion-3slots
                                                                           -    - Download NTFY app on iPhone/desktop or use web browser
                                                                                -    - Enable notifications
                                                                                 
                                                                                     - 2. **GitHub Repository**
                                                                                       3.    - This repository with the workflows enabled
                                                                                             -    - Workflows run automatically on schedule
                                                                                              
                                                                                                  - 3. **Notion Board**
                                                                                                    4.    - Your personal 3-Slot planning board
                                                                                                          -    - Updated manually after receiving notifications
                                                                                                           
                                                                                                               - ## Setup Instructions
                                                                                                           
                                                                                                               - ### 1. Subscribe to NTFY Notifications
                                                                                                           
                                                                                                               - **iPhone:**
                                                                                                               - - Download NTFY app from App Store
                                                                                                                 - - Open app and search for topic: `zion-3slots`
                                                                                                                   - - Subscribe and enable notifications
                                                                                                                    
                                                                                                                     - **Desktop:**
                                                                                                                     - - Visit https://ntfy.sh/zion-3slots in your browser
                                                                                                                       - - Click bell icon to enable desktop notifications
                                                                                                                         - - OR download NTFY desktop client
                                                                                                                          
                                                                                                                           - **Web:**
                                                                                                                           - - Visit https://ntfy.sh/zion-3slots
                                                                                                                             - - Stay on the page to receive notifications
                                                                                                                              
                                                                                                                               - ### 2. Enable GitHub Actions
                                                                                                                              
                                                                                                                               - This repository has GitHub Actions workflows that run automatically:
                                                                                                                              
                                                                                                                               - - Check the `Actions` tab to see scheduled workflow runs
                                                                                                                                 - - Workflows execute at specified times via GitHub's servers (no local setup needed)
                                                                                                                                   - - Manual trigger available with "Run workflow" button if needed
                                                                                                                                    
                                                                                                                                     - ### 3. Update Your Notion Board
                                                                                                                                    
                                                                                                                                     - After each notification, visit your Notion planning board:
                                                                                                                                     - - Review completed projects
                                                                                                                                       - - Update your 3 active slots
                                                                                                                                         - - Move items between slots or to the parking lot
                                                                                                                                           - - Revisit your GTD and על זה principles
                                                                                                                                            
                                                                                                                                             - ## Methodology
                                                                                                                                            
                                                                                                                                             - This system combines three proven methodologies:
                                                                                                                                            
                                                                                                                                             - **GTD (Getting Things Done)** by David Allen
                                                                                                                                             - - Capture everything
                                                                                                                                               - - Clarify next steps
                                                                                                                                                 - - Organize by context
                                                                                                                                                   - - Reflect weekly
                                                                                                                                                     - - Engage with confidence
                                                                                                                                                      
                                                                                                                                                       - **על זה** (Yair Yona's Self-Management)
                                                                                                                                                       - - כבישת הזמן (Time paving/calendar blocking)
                                                                                                                                                         - - המנהל vs הפועל (Manager vs Doer separation)
                                                                                                                                                           - - השומר (Distraction protection)
                                                                                                                                                             - - אחריות רדיקלית (Radical accountability)
                                                                                                                                                               - - חמלה רדיקלית (Radical compassion)
                                                                                                                                                                
                                                                                                                                                                 - **3-Slot Constraint**
                                                                                                                                                                 - - **Slot 1**: Money/Revenue (פרנסה)
                                                                                                                                                                   - - **Slot 2**: Build/Completion (בנייה)
                                                                                                                                                                     - - **Slot 3**: Explore/Learning (חקירה)
                                                                                                                                                                       - - **Parking Lot**: Ideas waiting to be activated
                                                                                                                                                                         - - Maximum 3 active projects at once
                                                                                                                                                                           - - Intentional project swaps during weekly review
                                                                                                                                                                            
                                                                                                                                                                             - ## Workflow Schedules
                                                                                                                                                                            
                                                                                                                                                                             - **Daily Evening Review**
                                                                                                                                                                             - - Time: 18:00 UTC (20:00 Israel time)
                                                                                                                                                                               - - Frequency: Every day
                                                                                                                                                                                 - - Cron: `0 18 * * *`
                                                                                                                                                                                   - - Action: Send NTFY notification with planning prompts
                                                                                                                                                                                    
                                                                                                                                                                                     - **Weekly Sunday Planning**
                                                                                                                                                                                     - - Time: 05:00 UTC (07:00 Israel time)
                                                                                                                                                                                       - - Frequency: Every Sunday
                                                                                                                                                                                         - - Cron: `0 5 * * 0`
                                                                                                                                                                                           - - Action: Send NTFY notification with 30-minute planning agenda
                                                                                                                                                                                            
                                                                                                                                                                                             - ## Testing
                                                                                                                                                                                            
                                                                                                                                                                                             - To test the workflows manually:
                                                                                                                                                                                            
                                                                                                                                                                                             - 1. Visit the `Actions` tab in this repository
                                                                                                                                                                                               2. 2. Select a workflow (e.g., "Daily Evening Review")
                                                                                                                                                                                                  3. 3. Click "Run workflow"
                                                                                                                                                                                                     4. 4. Manually trigger a test push notification
                                                                                                                                                                                                        5. 5. Verify NTFY notification arrives on your devices
                                                                                                                                                                                                          
                                                                                                                                                                                                           6. ## Important Notes
                                                                                                                                                                                                          
                                                                                                                                                                                                           7. - **Timezone**: All workflows use UTC time. Adjust cron expressions if needed for your timezone
                                                                                                                                                                                                              - - **NTFY is Free**: No sign-up required for basic notifications
                                                                                                                                                                                                                - - **Privacy**: NTFY messages are not encrypted; avoid sending sensitive data
                                                                                                                                                                                                                  - - **Reliability**: GitHub Actions can occasionally have 5-10 minute delays
                                                                                                                                                                                                                    - - **Always Manual**: The system sends reminders, but you must manually update your Notion board
                                                                                                                                                                                                                     
                                                                                                                                                                                                                      - ## Next Steps
                                                                                                                                                                                                                     
                                                                                                                                                                                                                      - 1. ✅ Subscribe to NTFY notifications
                                                                                                                                                                                                                        2. 2. ✅ Verify GitHub Actions are running
                                                                                                                                                                                                                           3. 3. 🔄 Test both workflows with manual triggers
                                                                                                                                                                                                                              4. 4. 📝 Update your Notion board after each notification
                                                                                                                                                                                                                                 5. 5. 📊 Complete one full week of planning cycles
                                                                                                                                                                                                                                    6. 6. 📈 Evaluate and adjust as needed
                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                       7. ---
                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                       8. **Created for**: Radical accountability + Radical compassion
                                                                                                                                                                                                                                       9. **Methodology**: GTD + על זה + 3-Slot System
                                                                                                                                                                                                                                       10. **Delivery**: NTFY (Cloud-based push notifications)
