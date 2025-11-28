import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.concurrent.atomic.AtomicBoolean;

public class MouseMover extends JFrame {

    private JTextField intervalField;
    private JLabel statusLabel;
    private JButton startButton;
    private JProgressBar progressBar;
    private Thread moverThread;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    public MouseMover() {
        setTitle("Mouse Mover");
        setSize(300, 250);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new FlowLayout());
        setLocationRelativeTo(null); // Center on screen

        // Components
        JLabel instructionLabel = new JLabel("Interval (seconds):");
        intervalField = new JTextField("10", 5);
        startButton = new JButton("Start");
        statusLabel = new JLabel("Status: Stopped");
        statusLabel.setForeground(Color.RED);
        
        progressBar = new JProgressBar();
        progressBar.setStringPainted(true);
        progressBar.setForeground(Color.GREEN.darker());
        progressBar.setPreferredSize(new Dimension(250, 20));
        progressBar.setVisible(false);

        // Add components
        add(instructionLabel);
        add(intervalField);
        add(startButton);
        add(statusLabel);
        add(progressBar);

        // Add help text
        JLabel helpLabel = new JLabel("<html><br><center>Click anywhere inside this<br>window to STOP.</center></html>");
        add(helpLabel);

        // Event Listeners
        startButton.addActionListener(e -> startMoving());

        // Global mouse listener to stop on click
        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                stopMoving();
            }
        });
        
        // Also add listener to content pane to ensure clicks are caught
        getContentPane().addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                stopMoving();
            }
        });
    }

    private void startMoving() {
        if (isRunning.get()) return;

        String text = intervalField.getText();
        int intervalSeconds;
        try {
            intervalSeconds = Integer.parseInt(text);
            if (intervalSeconds <= 0) throw new NumberFormatException();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Please enter a valid positive number for seconds.", "Invalid Input", JOptionPane.ERROR_MESSAGE);
            return;
        }

        isRunning.set(true);
        statusLabel.setText("Status: Running");
        statusLabel.setForeground(Color.GREEN.darker());
        startButton.setEnabled(false);
        intervalField.setEnabled(false);
        
        progressBar.setVisible(true);
        progressBar.setMaximum(intervalSeconds);
        progressBar.setValue(intervalSeconds);
        progressBar.setString(intervalSeconds + "s");

        moverThread = new Thread(() -> {
            try {
                Robot robot = new Robot();
                while (isRunning.get()) {
                    // Wait for the interval
                    for (int i = intervalSeconds; i > 0; i--) {
                        if (!isRunning.get()) return;
                        final int remaining = i;
                        SwingUtilities.invokeLater(() -> {
                            progressBar.setValue(remaining);
                            progressBar.setString(remaining + "s");
                        });
                        Thread.sleep(1000);
                    }

                    if (!isRunning.get()) return;
                    
                    SwingUtilities.invokeLater(() -> {
                        progressBar.setValue(0);
                        progressBar.setString("Moving...");
                    });

                    // Move mouse slightly
                    Point location = MouseInfo.getPointerInfo().getLocation();
                    robot.mouseMove(location.x + 1, location.y + 1);
                    robot.mouseMove(location.x, location.y);
                }
            } catch (InterruptedException e) {
                // Expected when stopping
            } catch (AWTException e) {
                e.printStackTrace();
            } finally {
                // Ensure UI is reset if thread dies unexpectedly
                SwingUtilities.invokeLater(this::stopMoving);
            }
        });
        moverThread.start();
    }

    private void stopMoving() {
        if (!isRunning.get()) return;

        isRunning.set(false);
        if (moverThread != null) {
            moverThread.interrupt();
        }
        
        statusLabel.setText("Status: Stopped");
        statusLabel.setForeground(Color.RED);
        startButton.setEnabled(true);
        intervalField.setEnabled(true);
        progressBar.setVisible(false);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new MouseMover().setVisible(true);
        });
    }
}
