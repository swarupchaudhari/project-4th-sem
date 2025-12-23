import java.util.*;

public class TaskManager {

    ArrayList<Task> taskList = new ArrayList<>();
    HashMap<Integer, Task> taskMap = new HashMap<>();
    PriorityQueue<Task> priorityQueue;
    LinkedList<Task> history = new LinkedList<>();

    public TaskManager() {
        priorityQueue = new PriorityQueue<>(
            (a, b) -> b.priority - a.priority
        );
    }

    // Add Task
    public void addTask(Task task) {
        taskList.add(task);
        taskMap.put(task.id, task);
        priorityQueue.add(task);
        history.add(task);
        System.out.println("✅ Task Added Successfully");
    }

    // View All Tasks
    public void viewTasks() {
        if (taskList.isEmpty()) {
            System.out.println("No tasks available.");
            return;
        }
        for (Task t : taskList) {
            System.out.println(t);
        }
    }

    // Search Task
    public void searchTask(int id) {
        Task task = taskMap.get(id);
        if (task != null)
            System.out.println(task);
        else
            System.out.println("❌ Task Not Found");
    }

    // Update Task Status
    public void updateStatus(int id) {
        Task task = taskMap.get(id);
        if (task != null) {
            task.status = "Completed";
            System.out.println("✅ Task Completed");
        } else {
            System.out.println("❌ Task Not Found");
        }
    }

    // Delete Task
    public void deleteTask(int id) {
        Task task = taskMap.remove(id);
        if (task != null) {
            taskList.remove(task);
            priorityQueue.remove(task);
            System.out.println("🗑️ Task Deleted");
        } else {
            System.out.println("❌ Task Not Found");
        }
    }

    // Show Priority Tasks
    public void showPriorityTasks() {
        PriorityQueue<Task> temp = new PriorityQueue<>(priorityQueue);
        while (!temp.isEmpty()) {
            System.out.println(temp.poll());
        }
    }

    // Sort by Deadline
    public void sortByDeadline() {
        taskList.sort(Comparator.comparing(t -> t.deadline));
        System.out.println("📅 Tasks Sorted by Deadline");
    }

    // Performance Info
    public void performance() {
        System.out.println("Add Task: O(log n)");
        System.out.println("Search Task: O(1)");
        System.out.println("Delete Task: O(log n)");
        System.out.println("Sort Task: O(n log n)");
    }
}