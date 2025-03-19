import java.util.Optional;

class WaitEvent extends Event {
    private final Server server;

    WaitEvent(Customer customer, double eventTime, Server server) {
        super(customer, eventTime);
        this.server = server;
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        double serviceTime = shop.getServiceTime();
        double newEventTime = serviceTime + this.server.getNextCustomerTime();
        //Shop newShop = shop.update(super.customer, this.server, newEventTime);
        if (this.server.canServeAtTime(this.server.getNextCustomerTime())) {
            Shop newShop = shop.update(super.customer, this.server, 
                    newEventTime);
            return Optional.of(new Pair<Event,Shop>(new ServeEvent(
                            super.customer, this.server, 
                            this.server.getNextCustomerTime(), true, newEventTime),
                        newShop));
        }
        return Optional.of(new Pair<Event,Shop>(new WaitEvent(super.customer,
                        serviceTime, this.server), shop));
    }

    @Override
    public double getWaitingTime() {
        return this.server.getNextCustomerTime() - super.eventTime;
    }
    

    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer
            + " waits at " + this.server;
    }
}
