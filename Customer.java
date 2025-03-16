class Customer {
    private final int id;
    private final double arrivalTime;
    
    Customer(int id, double arrivalTime) {
        this.id = id;
        this.arrivalTime = arrivalTime;
    }
    
    @Override
    public String toString() {
        return "customer " + this.id;
    }

    public boolean canBeServed(double time) {
        return this.arrivalTime >= time;
    }

    public double serveTill(double serviceTime) {
        return this.arrivalTime + serviceTime;
    }

    public int compareArrivalTime(Customer other) {
        return Double.compare(this.arrivalTime, other.arrivalTime);
    }

    public double getArrivalTime() {
        return this.arrivalTime;
    }
}
