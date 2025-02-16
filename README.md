# AdFriend Chrome extension

![AdFriend Logo](icons/128.png)

### Overview
AdFriend is a Chrome extension that transforms your browsing experience by replacing advertisements with positive, motivational content. Instead of seeing ads, you'll encounter inspiring quotes and helpful activity reminders that promote well-being and productivity.

![Adfriend archive file ] (https://drive.google.com/file/d/11bTJLtl4Omaf6tbQxrusWsiTakEqLbxQ/view?usp=sharing)

# Features

- **🔄 Smart Ad Replacement**: Automatically detects and replaces ads with custom widgets
- **💭 Motivational Quotes**: Displays inspiring quotes to keep you motivated
- **⏰ Activity Reminders**: Shows timely reminders for breaks and activities
- **🎨 Custom Content**: Add your own quotes and reminders
- **📊 Progress Tracking**: Monitor your activity completion rates
- **⚙️ Customizable Settings**: Toggle features on/off as needed
- **➕ Quick Add**: Floating button for easy addition of new content

# Installation
1. Clone this repository:
```bash
git clone git@github.com:mwihoti/Ads-Replacer.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load Unpacked" and select the extension directory

## Usage

- After installation, Adfriend will automatically start replacing ads with motivational content
- Click the extension icon in your toolbar to:
    - Manage settings
    - Add custom reminders
    - Add personal notes/quotes
    - view progress

  
### Adding Custom Content

#### Reminders
1. Open the extension popup
2. Go to the "Reminders" tab
3. Enter your reminder text
4. Select frequency (hourly/daily/weekly)
5. Choose category
6. Click "Add Reminder"

#### Notes/Quotes
1. Open the extension popup
2. Go to the "Notes" tab
3. Enter your text
4. Click save

### Quick Add Feature
- Click the floating "+" button on any webpage
- Add reminders or notes instantly
- Changes take effect immediately


## 🔧 Technical Details

### Project Structure
```
adfriend/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   └── content.js
└── assets/
    └── icons/
```

### Core Components

#### manifest.json
- Extension configuration
- Permissions
- Resource declarations

#### content.js
- Ad detection and replacement
- Widget creation and management
- Custom content distribution

#### popup.js
- User interface logic
- Settings management
- Storage handling

### Storage
- Uses Chrome's Storage Sync API
- Stores:
  - Custom reminders
  - Personal notes
  - User settings
  - Progress data

## 👩‍💻 Development

### Prerequisites
- Google Chrome Browser
- Basic knowledge of:
  - JavaScript (ES6+)
  - Chrome Extension APIs
  - HTML/CSS

### Local Development
1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test changes

### Building for Production
1. Update version in manifest.json
2. Package extension:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select your extension directory

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
