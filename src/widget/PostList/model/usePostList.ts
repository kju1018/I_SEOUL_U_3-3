import { useState } from "react"
import { fetchPostsApi } from "../../../entities/post/api/postApi"
import { fetchUsersApi } from "../../../entities/user/api/userApi"
import { Post } from "../../../entities/post/model/types"

export const usePostList = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchPosts = async (limit: number, skip: number) => {
    setLoading(true)
    try {
      const postsData = await fetchPostsApi(limit, skip)
      const usersData = await fetchUsersApi()

      const postsWithUsers = postsData.posts.map((post: Post) => ({
        ...post,
        author: usersData.users.find((user: any) => user.id === post.userId),
      }))

      setPosts(postsWithUsers)
      setTotal(postsData.total)
    } catch (error) {
      console.error("게시물 가져오기 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    posts,
    setPosts,
    total,
    setTotal,
    loading,
    setLoading,
    fetchPosts,
  }
}
