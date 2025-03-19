import java.util.Optional;

class ArriveEvent extends Event {
    ArriveEvent(Customer customer, double eventTime) {
        super(customer, eventTime);
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        return shop.findServer(super.customer)
            .map(x -> {
                double newEventTime = super.eventTime + shop.getServiceTime();
                Shop newShop = shop.update(super.customer, x, newEventTime);
                return new Pair<Event,Shop>(new ServeEvent(super.customer, x,
                            super.eventTime, false, newEventTime), newShop);
            })
            .or(() -> shop.findServerQueue()
                    .map(y -> {
                        Server newServer = y.addToQueue();
                        Shop newShop = shop.addQueue(newServer);
                        return new Pair<Event,Shop>(new WaitEvent(
                                    super.customer, super.eventTime, newServer),
                                newShop);
                    }))
        .or(() -> Optional.of(new Pair<Event,Shop>(new LeaveEvent(
                            super.customer, super.eventTime), shop)));
    }

    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer 
            + " arrives";
    }
}
