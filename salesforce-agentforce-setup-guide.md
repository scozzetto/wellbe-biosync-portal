# Salesforce Agentforce Setup Guide - Be Well BioSync

## STEP 1: Access Agentforce in Salesforce

1. **Log into Salesforce:** https://thebusinesslab.lightning.force.com/
2. **Click the App Launcher** (9 dots icon in top left)
3. **Search for "Service"** and click **Service Console**
4. **In the left navigation,** look for **"Einstein Bots"** or **"Agentforce"**
   - If you don't see it, go to **Setup** (gear icon) → Search **"Einstein Bots"**
   - Enable Einstein Bots if not already enabled

## STEP 2: Create New Agentforce Agent

1. **Click "New Bot"** or **"Create Agent"**
2. **Bot Name:** `Be Well BioSync Assistant`
3. **Description:** `Intelligent health assessment for personalized wellness recommendations`
4. **API Name:** `BeWell_BioSync_Assistant`
5. **Click "Create"**

## STEP 3: Configure Basic Settings

1. **In Bot Builder, go to Overview**
2. **Bot Greeting:** 
```
Hi! I'm your Be Well health assistant. I'm here to help you discover the perfect wellness plan tailored specifically for YOU. 

This conversation will take about 10-15 minutes, and I'll ask about your health goals, any concerns you have, and what you're hoping to achieve. At the end, I'll provide personalized recommendations for our services.

Ready to get started? What's your first name?
```

3. **Fallback Message:**
```
I want to make sure I understand you correctly. Could you please rephrase that or choose from the options I provided?
```

## STEP 4: Set Up Data Collection Variables

**Go to Variables section and create these variables:**

### Contact Information
- `FirstName` (Text)
- `LastName` (Text) 
- `Email` (Email)
- `Phone` (Phone)
- `DateOfBirth` (Date)
- `Address1` (Text)
- `Address2` (Text)
- `City` (Text)
- `State` (Text)
- `ZipCode` (Text)
- `EmergencyContactName` (Text)
- `EmergencyContactPhone` (Phone)
- `PreferredLocation` (Picklist: Birmingham Location)

### Health Assessment
- `HealthGoals` (Long Text Area)
- `MotivationLevel` (Number: 1-10)
- `BiggestObstacle` (Text)
- `CurrentPain` (Boolean)
- `PainDetails` (Long Text Area)
- `PreviousTreatments` (Long Text Area)
- `ServiceInterests` (Multi-Select Picklist)
- `TotalTransformationInterest` (Boolean)
- `ProgramPreference` (Picklist)

### Medical History
- `Contraindications` (Long Text Area)
- `CurrentMedications` (Long Text Area)
- `CurrentSupplements` (Long Text Area)
- `SurgeryHistory` (Long Text Area)
- `AlcoholUse` (Picklist)
- `RecreationalDrugs` (Picklist)
- `SpecialDiet` (Picklist)
- `RecentBloodWork` (Boolean)
- `RecentXrays` (Boolean)
- `RecentMRI` (Boolean)

### Preferences
- `TreatmentPreference` (Picklist)
- `SchedulingPreference` (Text)

### Legal
- `ElectronicSignature` (Text)
- `ConsentGiven` (Boolean)

## STEP 5: Create the Conversation Flow

**Go to Dialogs section and create these dialogs:**

### Dialog 1: Welcome & Goals
```
Bot: Hi! I'm your Be Well health assistant. Ready to get started? What's your first name?

[Collect FirstName]

Bot: Great to meet you, {!FirstName}! Let's start with what matters most - what brought you to Be Well today? What are you hoping to achieve with your health?

[Collect HealthGoals]

Bot: That's a great goal! On a scale of 1-10, how motivated are you to make changes right now?
- 1-3: Just exploring options
- 4-6: Ready to start soon  
- 7-8: Very motivated
- 9-10: Ready to start immediately

[Collect MotivationLevel]

Bot: What's been the biggest obstacle keeping you from reaching your health goals so far? Things like time, money, energy, knowledge, or consistency?

[Collect BiggestObstacle]
```

### Dialog 2: Health Assessment
```
Bot: Now let's talk about how you're feeling right now. Do you currently experience any pain or discomfort?

[Collect CurrentPain - Yes/No]

[If CurrentPain = Yes]
Bot: Can you tell me where the pain is located, how severe it is on a scale of 1-10, and how long you've been dealing with this?

[Collect PainDetails]

Bot: Have you ever experienced chiropractic care, massage therapy, IV therapy, colon hydrotherapy, or other holistic treatments before?

[Collect PreviousTreatments]
```

### Dialog 3: Service Interests
```
Bot: Which of our services are you most interested in learning about? You can choose as many as you'd like:

[Multi-select options:]
- Chiropractic
- Dry Needling
- Cupping
- Compression Therapy
- Electric Stim/Ultrasound Therapy
- Red Light/Laser Pain Treatment
- Massage Therapy
- Colon Hydrotherapy
- IV Vitamin Therapy
- Vitamin Injections
- Peptide Therapy
- Blood/Urine Testing
- Nutrition Assistance
- Be Well Total Transformation

[Collect ServiceInterests]

Bot: Are you interested in our Total Transformation program? This is our comprehensive 12-week system that completely revolutionizes your health and lifestyle.

[Collect TotalTransformationInterest - Yes/No]

[If TotalTransformationInterest = Yes]
Bot: Great! For this type of comprehensive transformation, are you more drawn to:
- A structured weekly program with coaching
- A flexible plan with simple recommendations
- A mix of both

[Collect ProgramPreference]
```

### Dialog 4: Medical History
```
Bot: Now I need to ask about your medical history to ensure we recommend safe treatments. Do you have any conditions like pacemaker, blood thinners, cancer, or other serious health concerns?

[Collect Contraindications]

Bot: What medications are you currently taking? If none, just say 'none'.

[Collect CurrentMedications]

Bot: What supplements are you taking, including any peptides? If none, just say 'none'.

[Collect CurrentSupplements]

Bot: Have you had any surgeries? If none, just say 'none'.

[Collect SurgeryHistory]
```

### Dialog 5: Lifestyle
```
Bot: A few questions about your lifestyle:

Do you drink alcohol?
- Never
- Occasionally (1-2 drinks per week)
- Moderately (3-7 drinks per week)  
- Frequently (more than 7 drinks per week)

[Collect AlcoholUse]

Bot: Do you use any recreational drugs?
- No
- Occasionally
- Regularly

[Collect RecreationalDrugs]

Bot: Are you following any special diet?
- No special diet
- Keto
- Vegetarian
- Vegan
- Paleo
- Other

[Collect SpecialDiet]
```

### Dialog 6: Recent Tests
```
Bot: Have you had blood work done in the past 6 months?

[Collect RecentBloodWork - Yes/No]

Bot: Have you had any X-rays in the past 6 months?

[Collect RecentXrays - Yes/No]

Bot: Any MRI or other scans in the past 6 months?

[Collect RecentMRI - Yes/No]
```

### Dialog 7: Preferences
```
Bot: Are you more interested in:
- Immediate relief for current symptoms
- Long-term health transformation
- Both immediate relief AND long-term transformation

[Collect TreatmentPreference]

Bot: What days and times work best for appointments? For example, 'weekday mornings' or 'Saturday afternoons'?

[Collect SchedulingPreference]
```

### Dialog 8: Contact Information
```
Bot: Perfect! Now I just need your contact information so we can follow up with your personalized recommendations.

What's your last name?
[Collect LastName]

What's your date of birth? (MM/DD/YYYY)
[Collect DateOfBirth]

What's the best phone number to reach you?
[Collect Phone]

And your email address?
[Collect Email]

Your address? (We'll start with street address)
[Collect Address1, Address2, City, State, ZipCode]

For emergency contact, who should we call and what's their number?
[Collect EmergencyContactName, EmergencyContactPhone]

Which Be Well location would you prefer?
[Collect PreferredLocation]
```

### Dialog 9: Legal Consent
```
Bot: Almost done! I need to go over our important disclosure and consent information.

[Display full legal text from FormAssembly]

Do you understand and agree to these terms?
[Collect ConsentGiven - Yes/No]

Please type your full legal name as your electronic signature:
[Collect ElectronicSignature]
```

### Dialog 10: Recommendations
```
Bot: Thank you, {!FirstName}! Based on everything you've told me, here are my personalized recommendations:

[Add conditional logic based on responses]

If {!CurrentPain} = Yes AND {!ServiceInterests} contains "Chiropractic":
"I recommend starting with chiropractic care to address your pain."

If {!TotalTransformationInterest} = Yes:
"The Total Transformation program would be perfect for your goals."

Bot: Here's what happens next:
1. A Be Well specialist will review your responses within 24 hours
2. We'll call you at {!Phone} to discuss your personalized plan  
3. We'll schedule your first appointment at a time that works for you

Thank you for choosing Be Well LifeStyle Centers!
```

## STEP 6: Create Salesforce Object Mapping

1. **Go to Object Mapping in Bot Builder**
2. **Map to Lead object** (or create custom BioSync object)
3. **Map each variable to corresponding Salesforce fields:**

```
FirstName → Lead.FirstName
LastName → Lead.LastName
Email → Lead.Email
Phone → Lead.Phone
HealthGoals → Lead.Description
MotivationLevel → Lead.Custom_Field__c
[Continue mapping all variables]
```

## STEP 7: Test the Bot

1. **Click "Preview" in Bot Builder**
2. **Test the complete conversation flow**
3. **Verify data is being captured**
4. **Check Salesforce Lead records are created**

## STEP 8: Deploy to Website

1. **Go to Channels in Bot Builder**
2. **Add "Web Chat" channel**
3. **Configure appearance settings:**
   - Chat bubble color: #A47C5B (Be Well brand color)
   - Welcome message: "Need help choosing the right wellness plan?"
4. **Generate embed code**
5. **Copy the embed code**

## STEP 9: Add Embed Code to Website

Replace the placeholder in `biosync-agentforce.html`:

```javascript
function initializeAgentforce() {
    // Paste your Salesforce embed code here
    embedded_svc.settings.displayHelpButton = true;
    embedded_svc.settings.language = 'en_US';
    
    embedded_svc.init(
        'YOUR_ORG_URL',
        'YOUR_DEPLOYMENT_ID', 
        'YOUR_BUTTON_ID',
        {
            baseLiveAgentContentURL: 'YOUR_CONTENT_URL',
            deploymentId: 'YOUR_DEPLOYMENT_ID',
            buttonId: 'YOUR_BUTTON_ID'
        }
    );
}
```

## STEP 10: Final Testing

1. **Test on your website**
2. **Complete a full conversation**
3. **Verify Lead record is created in Salesforce**
4. **Check all data fields are populated**
5. **Test recommendations logic**

## TROUBLESHOOTING

**If you can't find Einstein Bots:**
- Go to Setup → Einstein → Einstein Bots
- Enable the feature if not already enabled

**If variables aren't saving:**
- Check field mapping in Object Mapping section
- Ensure proper data types are set

**If embed code doesn't work:**
- Check website domain is allowlisted in Salesforce
- Verify all required fields in embed code

**Need Help?**
- Salesforce has extensive Agentforce documentation
- Search "Einstein Bot Builder" in Salesforce Help

---

## NEXT STEPS AFTER SETUP

1. **Test thoroughly** with multiple conversation paths
2. **Refine recommendations logic** based on testing
3. **Train your team** on reviewing Agentforce-generated leads
4. **Monitor conversation analytics** in Salesforce
5. **Iterate and improve** based on user feedback

This setup will give you a fully functional AI health assistant that captures all the same data as your FormAssembly form, but in a much more engaging conversational format!