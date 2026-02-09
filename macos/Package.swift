// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "FloatyNotey",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(name: "FloatyNotey", path: "Sources"),
    ]
)
