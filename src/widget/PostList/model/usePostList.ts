import { useMemo } from "react"
import { usePostStore } from "../../../entities/post/model/usePostStore"
import { useUserStore } from "../../../entities/user/model/useUserStore"
import { fetchPostsApi } from "../../../entities/post/api/postApi"
import { fetchUsersApi } from "../../../entities/user/api/userApi"
import { Post } from "../../../entities/post/model/types"
import { User } from "../../../entities/user/model/types"

// FSD 완벽 조합: 순수 Post와 User를 합친 UI 전용 데이터 계층 추출
export type PostWithAuthor = Post & {
  author?: User
}

export const usePostList = () => {
  const { posts, total, loading, setPosts, setTotal, setLoading } = usePostStore()
  const { users, setUsers } = useUserStore()

  const fetchPosts = async (limit: number, skip: number) => {
    setLoading(true)
    try {
      const postsData = await fetchPostsApi(limit, skip)
      setPosts(postsData.posts)
      setTotal(postsData.total)

      // 2. 타 도메인 데이터 별도 로딩 파이프라인
      if (users.length === 0) {
        const usersData = await fetchUsersApi()
        setUsers(usersData.users)
      }
    } catch (error) {
      console.error("게시물/유저 가져오기 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 3. 교집합 타입(PostWithAuthor)을 활용한 안전한 맵핑 로직 (원본 손상 X)
  const postsWithUsers: PostWithAuthor[] = useMemo(() => {
    return posts.map((post: Post) => ({
      ...post,
      author: users.find((user: User) => user.id === post.userId),
    }))
  }, [posts, users])

  return {
    posts: postsWithUsers,
    setPosts, 
    total,
    setTotal,
    loading,
    setLoading,
    fetchPosts,
  }
}
