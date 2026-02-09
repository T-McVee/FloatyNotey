import AppKit
import WebKit
import Carbon.HIToolbox

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

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

// --- WKWebView ---
let webView = WKWebView(frame: panel.contentView!.bounds)
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
