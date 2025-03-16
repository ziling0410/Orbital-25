import java.util.Optional;

class ServeEvent extends Event {
    private final Server server;

    ServeEvent(Customer customer, Server server, double eventTime) {
        super(customer, eventTime);
        this.server = server;
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        double newEventTime = super.eventTime + shop.getServiceTime();
        Shop newShop = shop.update(super.customer, this.server);
        return Optional.of(new Pair<Event,Shop>(new DoneEvent(super.customer, 
                    newEventTime), newShop));
    }
    
    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer 
            + " serves by " + this.server;
    }
}
