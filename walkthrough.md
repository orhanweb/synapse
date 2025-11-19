# Personal Knowledge Graph - Walkthrough

Congratulations! Your **Personal Knowledge Graph** application is ready. This guide will help you explore its features.

## 🚀 Getting Started

1.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
2.  Open your browser at `http://localhost:5173`.

## 📝 Features & Usage

### 1. Creating Notes
-   Click the **+** button in the sidebar to create a new note.
-   Enter a **Title** (e.g., "Artificial Intelligence").
-   Write your content in **Markdown**.
-   Click **Save** (or `Cmd+S` if we added shortcuts, but for now just the button).

### 2. Linking Notes (The Magic ✨)
To link two notes, simply reference the title of another note inside double brackets:
-   Example: "Machine Learning is a subset of **[[Artificial Intelligence]]**."
-   The app will automatically detect this link and update the graph.

### 3. Graph Visualization 🕸️
-   Click the **Graph View** button in the top-right corner.
-   You will see your notes as nodes and links as edges.
-   **Interact:**
    -   **Drag** nodes to rearrange them (physics-based!).
    -   **Click** a node to open that note.
    -   **Zoom/Pan** to explore large graphs.

### 4. Search & Management
-   Use the **Search Bar** in the sidebar to filter notes by title or content.
-   Click the **Trash Icon** to delete a note (be careful, it's permanent!).

## 🛠️ Technical Highlights
-   **Storage:** All data is saved in your browser's **IndexedDB**. It persists even if you close the tab or restart the computer.
-   **Performance:** Powered by **React 19**, **Tailwind v4**, and **Zustand** for blazing fast updates.
-   **Architecture:** Built with **Clean Architecture** principles, ready for future backend integration.

Enjoy building your second brain! 🧠
