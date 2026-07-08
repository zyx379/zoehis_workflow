import java.sql.*;

public class DamengQuery {
    public static void main(String[] args) {
        if (args.length < 5) {
            System.err.println("ERROR: Missing arguments");
            System.exit(1);
        }
        
        String host = args[0];
        String port = args[1];
        String username = args[2];
        String password = args[3];
        String sql = args[4];
        
        try {
            Class.forName("dm.jdbc.driver.DmDriver");
            String url = "jdbc:dm://" + host + ":" + port + "/";
            Connection conn = DriverManager.getConnection(url, username, password);
            
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);
            
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            
            // Build columns array
            StringBuilder columnsBuilder = new StringBuilder();
            columnsBuilder.append("[");
            for (int i = 1; i <= columnCount; i++) {
                if (i > 1) columnsBuilder.append(",");
                columnsBuilder.append("\"").append(escapeJson(metaData.getColumnName(i))).append("\"");
            }
            columnsBuilder.append("]");
            
            // Build rows array
            StringBuilder rowsBuilder = new StringBuilder();
            rowsBuilder.append("[");
            int rowCount = 0;
            boolean firstRow = true;
            while (rs.next() && rowCount < 100) {
                if (!firstRow) rowsBuilder.append(",");
                firstRow = false;
                rowsBuilder.append("[");
                for (int i = 1; i <= columnCount; i++) {
                    if (i > 1) rowsBuilder.append(",");
                    String value = rs.getString(i);
                    if (value == null) {
                        rowsBuilder.append("null");
                    } else {
                        rowsBuilder.append("\"").append(escapeJson(value)).append("\"");
                    }
                }
                rowsBuilder.append("]");
                rowCount++;
            }
            rowsBuilder.append("]");
            
            // Output JSON
            System.out.println("{\"columns\":" + columnsBuilder + ",\"rows\":" + rowsBuilder + ",\"rowCount\":" + rowCount + "}");
            
            rs.close();
            stmt.close();
            conn.close();
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            System.exit(1);
        }
    }
    
    private static String escapeJson(String str) {
        if (str == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : str.toCharArray()) {
            switch (c) {
                case '\"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '/': sb.append("\\/"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default: sb.append(c);
            }
        }
        return sb.toString();
    }
}
