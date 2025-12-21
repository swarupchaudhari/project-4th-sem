 public class Task {
    int id;
    String name;
    int priority;
    String deadline;
    String status;

    public Task(int id, String name, int priority, String deadline) {
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.deadline = deadline;
        this.status = "Pending";
    }

    @Override
    public String toString() {
        return "ID: " + id +
               ", Name: " + name +
               ", Priority: " + priority +
               ", Deadline: " + deadline +
               ", Status: " + status;
    }
}