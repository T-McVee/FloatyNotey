import AppKit
import WebKit
import Carbon.HIToolbox

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

// --- Main Menu with Edit actions (enables ⌘C, ⌘V, ⌘X, ⌘A in WKWebView) ---
let mainMenu = NSMenu()
let editMenuItem = NSMenuItem()
mainMenu.addItem(editMenuItem)
let editMenu = NSMenu(title: "Edit")
editMenu.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
editMenu.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
editMenu.addItem(NSMenuItem.separator())
editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
editMenuItem.submenu = editMenu
app.mainMenu = mainMenu

// --- Floating Panel ---
let panel = NSPanel(
    contentRect: NSRect(x: 0, y: 0, width: 400, height: 600),
    styleMask: [.titled, .closable, .resizable, .nonactivatingPanel, .utilityWindow],
    backing: .buffered,
    defer: false
)
panel.title = "FloatyNotey"
panel.level = .floating
panel.isFloatingPanel = true
panel.hidesOnDeactivate = false
panel.center()

// --- WKWebView UI Delegate (handles window.open → Safari) ---
class WebUIDelegate: NSObject, WKUIDelegate {
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url,
           url.host != webView.url?.host {
            NSWorkspace.shared.open(url)
        }
        return nil
    }
}

let uiDelegate = WebUIDelegate()

// --- WKWebView ---
let webView = WKWebView(frame: panel.contentView!.bounds)
webView.uiDelegate = uiDelegate
webView.autoresizingMask = [.width, .height]
panel.contentView!.addSubview(webView)

let url = URL(string: "http://localhost:3000")!
webView.load(URLRequest(url: url))

panel.makeKeyAndOrderFront(nil)

// --- Global Hotkey (⌥ N) ---
let hotkeyID = EventHotKeyID(signature: 0x464E_5459, id: 1) // "FNTY"
var hotkeyRef: EventHotKeyRef?

RegisterEventHotKey(
    UInt32(kVK_ANSI_N),
    UInt32(optionKey),
    hotkeyID,
    GetApplicationEventTarget(),
    0,
    &hotkeyRef
)

var eventSpec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
InstallEventHandler(GetApplicationEventTarget(), { _, event, _ -> OSStatus in
    if panel.isVisible {
        panel.orderOut(nil)
    } else {
        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
    return noErr
}, 1, &eventSpec, nil, nil)

app.run()
