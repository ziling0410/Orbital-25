import java.util.Optional;

class LeaveEvent extends Event {
    LeaveEvent(Customer customer, double eventTime) {
        super(customer, eventTime);
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        return Optional.of(new Pair<Event,Shop>(this, shop));
    }
    
    @Override
    public int getCustomersLeft() {
        return 1;
    }

    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer 
            + " leaves";
    }
}
