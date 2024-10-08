import { DataPoint } from "@renderer/types";
import { ColumnDef } from "@tanstack/react-table";
import styles from '../assets/row.module.css'

export const columns: ColumnDef<DataPoint>[] = [
    {
        accessorKey: 'index',
        header: 'Index'
    },
    {
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => {
            const value = parseFloat(row.getValue("score")).toFixed(3)
            const color = row.original.color

            return <div className="flex flex-row gap-2">
                <span>{value}</span>
                <div className={styles.colorCircle} style={{ backgroundColor: color || 'white' }}></div>
            </div>
        }
    }
]