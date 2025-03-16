import java.util.Optional;

class WaitEvent extends Event {
    private final Server server;

    WaitEvent(Customer customer, double eventTime, Server server) {
        super(customer, eventTime);
        this.server = server;
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        Server newServer = server.removeFromQueue();
        Shop newShop = shop.removeQueue(newServer);
        double newEventTime = Math.max(super.eventTime, newServer.getServiceTime());
        return Optional.of(new Pair<Event,Shop>(new ServeEvent(super.customer,
                    newServer, newEventTime), newShop));
    }

    @Override
    public double getWaitingTime() {
        return this.server.getServiceTime() - super.eventTime;
    }
    

    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer
            + " waits at " + this.server;
    }
}
