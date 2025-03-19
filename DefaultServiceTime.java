import java.util.function.Supplier;

class DefaultServiceTime implements Supplier<Double> {
    public Double get() {
        System.out.println("get");
        return 1.0;
    }
}

