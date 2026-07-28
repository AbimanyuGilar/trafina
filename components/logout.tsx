// import { authClient } from "@/lib/auth-client"
// import { useRouter } from "next/navigation"
// import { toast } from "sonner"

// const Dashboard = async () => {
//   const router = useRouter()

//   const { data: session } = await authClient.getSession()
  
//   const handleLogout = async () => {
//     await authClient.signOut();
//     toast.success('Berhasil logout.')
//     router.push('/login')
//   }

//   return (
//     <>
//       <form action={handleLogout}>
//         <button type="submit">Logout</button>
//       </form>
//     </>
//   )
// }

// export default Dashboard