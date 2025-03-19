import java.util.Optional;

class DoneEvent extends Event {
    DoneEvent(Customer customer, double eventTime) {
        super(customer, eventTime);
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        return Optional.of(new Pair<Event,Shop>(this, shop));
    }

    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer 
            + " done";
    }
}
