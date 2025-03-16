import java.util.Optional;

abstract class Event implements Comparable<Event> {
    protected final Customer customer;
    protected final double eventTime;

    Event(Customer customer, double eventTime) {
        this.customer = customer;
        this.eventTime = eventTime;
    }

    public abstract Optional<Pair<Event,Shop>> next(Shop shop);

    public double getWaitingTime() {
        return 0.0;
    }

    public int getCustomersLeft() {
        return 0;
    }

    public int compareTo(Event other) {
        int compareTime = Double.compare(this.eventTime, other.eventTime);
        return (compareTime != 0) ? compareTime : 
            this.customer.compareArrivalTime(other.customer);
    }
}
